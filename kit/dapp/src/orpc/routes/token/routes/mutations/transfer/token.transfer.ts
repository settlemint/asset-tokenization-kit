import { portalGraphql } from "@/lib/settlemint/portal";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { AssetExtensionEnum } from "@atk/zod/asset-extensions";
import { call } from "@orpc/server";

const TOKEN_TRANSFER_MUTATION = portalGraphql(`
  mutation TokenTransfer(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $to: String!
    $amount: String!
  ) {
    transfer: IERC3643Transfer(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        to: $to
        value: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_TRANSFER_FROM_MUTATION = portalGraphql(`
  mutation TokenTransferFrom(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $owner: String!
    $to: String!
    $amount: String!
  ) {
    transferFrom: IERC3643TransferFrom(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        from: $owner
        to: $to
        value: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_FORCED_TRANSFER_MUTATION = portalGraphql(`
  mutation TokenForcedTransfer(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $owner: String!
    $to: String!
    $amount: String!
  ) {
    forcedTransfer: ISMARTCustodianForcedTransfer(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        from: $owner
        to: $to
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const TOKEN_BATCH_TRANSFER_MUTATION = portalGraphql(`
  mutation TokenBatchTransfer(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $recipients: [String!]!
    $amounts: [String!]!
  ) {
    batchTransfer: IERC3643BatchTransfer(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        _toList: $recipients
        _amounts: $amounts
      }
    ) {
      transactionHash
    }
  }
`);

// Note: There is no batchTransferFrom in ERC3643 - transferFrom operations must be done individually

const TOKEN_BATCH_FORCED_TRANSFER_MUTATION = portalGraphql(`
  mutation TokenBatchForcedTransfer(
    $challengeId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $fromList: [String!]!
    $toList: [String!]!
    $amounts: [String!]!
  ) {
    batchForcedTransfer: ISMARTCustodianBatchForcedTransfer(
      address: $address
      from: $from
      challengeId: $challengeId
      challengeResponse: $challengeResponse
      input: {
        fromList: $fromList
        toList: $toList
        amounts: $amounts
      }
    ) {
      transactionHash
    }
  }
`);

export const transfer = tokenRouter.token.transfer
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.transfer,
    })
  )
  .handler(async ({ input, context, errors }) => {
    const {
      contract,
      recipients,
      amounts,
      from,
      transferType = "standard",
      walletVerification,
    } = input;
    const { auth } = context;

    // Determine if this is a batch operation
    const isBatch = recipients.length > 1;

    // For forced transfers, check custodian interface;
    if (transferType === "forced") {
      const supportsCustodian = context.token.extensions.includes(
        AssetExtensionEnum.CUSTODIAN
      );
      if (!supportsCustodian) {
        throw errors.TOKEN_INTERFACE_NOT_SUPPORTED({
          data: {
            requiredInterfaces: ["CUSTODIAN"],
          },
        });
      }
    }

    const sender = auth.user;
    // Choose the appropriate mutation based on transfer type and batch operation
    if (isBatch) {
      if (transferType === "standard") {
        // Standard batch transfer is supported
        validateBatchArrays(
          {
            recipients,
            amounts,
          },
          "batch transfer"
        );

        await context.portalClient.mutate(
          TOKEN_BATCH_TRANSFER_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            recipients,
            amounts: amounts.map((a) => a.toString()),
          },
          {
            sender: sender,
            code: walletVerification.secretVerificationCode,
            type: walletVerification.verificationType,
          }
        );
      } else if (transferType === "forced") {
        // Forced batch transfer is supported
        if (!from || from.length === 0) {
          throw errors.INPUT_VALIDATION_FAILED({
            message: "Missing required from addresses for forced transfer",
            data: { errors: ["Missing required from addresses"] },
          });
        }
        // Validate all arrays have matching lengths
        validateBatchArrays(
          {
            from,
            recipients,
            amounts,
          },
          "batch forced transfer"
        );
        await context.portalClient.mutate(
          TOKEN_BATCH_FORCED_TRANSFER_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            fromList: from,
            toList: recipients,
            amounts: amounts.map((a) => a.toString()),
          },
          {
            sender: sender,
            code: walletVerification.secretVerificationCode,
            type: walletVerification.verificationType,
          }
        );
      } else {
        // transferType === "transferFrom" - not supported in batch, must be done individually
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Batch transferFrom not supported",
          data: { errors: ["Batch transferFrom not supported"] },
        });
      }
    } else {
      // Single transfers
      const [to] = recipients;
      const [amount] = amounts;
      const [owner] = from ?? [];
      if (!to || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing recipient or amount",
          data: { errors: ["Invalid input data"] },
        });
      }
      if (transferType === "standard") {
        await context.portalClient.mutate(
          TOKEN_TRANSFER_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            to,
            amount: amount.toString(),
          },
          {
            sender: sender,
            code: walletVerification.secretVerificationCode,
            type: walletVerification.verificationType,
          }
        );
      } else if (transferType === "transferFrom") {
        // CASE 2: Allowance-based transfer - requires owner parameter
        // WHY: TransferFrom moves tokens from owner to recipient using sender's allowance
        if (!owner) {
          throw errors.INPUT_VALIDATION_FAILED({
            message: "Missing owner for transferFrom operation",
            data: { errors: ["Invalid input data"] },
          });
        }
        await context.portalClient.mutate(
          TOKEN_TRANSFER_FROM_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            owner,
            to,
            amount: amount.toString(),
          },
          {
            sender: sender,
            code: walletVerification.secretVerificationCode,
            type: walletVerification.verificationType,
          }
        );
      } else {
        // CASE 3: Forced transfer - administrative override requiring owner parameter
        // WHY: Forced transfers move tokens from specified owner without consent
        if (!owner) {
          throw errors.INPUT_VALIDATION_FAILED({
            message: "Missing owner for forced transfer",
            data: { errors: ["Invalid input data"] },
          });
        }
        await context.portalClient.mutate(
          TOKEN_FORCED_TRANSFER_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            owner,
            to,
            amount: amount.toString(),
          },
          {
            sender: sender,
            code: walletVerification.secretVerificationCode,
            type: walletVerification.verificationType,
          }
        );
      }
    }

    // UPDATED TOKEN DATA: Return fresh token information including new balances
    // WHY: Client needs updated balance information for sender and recipients
    // Portal middleware ensures transaction is confirmed and indexed before data refresh
    return await call(
      read,
      {
        tokenAddress: contract,
      },
      {
        context,
      }
    );
  });
