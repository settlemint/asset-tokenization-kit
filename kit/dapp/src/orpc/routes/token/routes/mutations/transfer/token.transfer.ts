import { portalGraphql } from "@/lib/settlemint/portal";
import { AssetExtensionEnum } from "@/lib/zod/validators/asset-extensions";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { read } from "@/orpc/routes/token/routes/token.read";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { call } from "@orpc/server";

const TOKEN_TRANSFER_MUTATION = portalGraphql(`
  mutation TokenTransfer(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $to: String!
    $amount: String!
  ) {
    transfer: IERC3643Transfer(
      address: $address
      from: $from
      verificationId: $verificationId
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
    $verificationId: String
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
      verificationId: $verificationId
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
    $verificationId: String
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
      verificationId: $verificationId
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
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $recipients: [String!]!
    $amounts: [String!]!
  ) {
    batchTransfer: IERC3643BatchTransfer(
      address: $address
      from: $from
      verificationId: $verificationId
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
    $verificationId: String
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
      verificationId: $verificationId
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
  .use(portalMiddleware)
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.transfer,
    })
  )
  .use(tokenMiddleware)
  .handler(async ({ input, context, errors }) => {
    const {
      contract,
      recipients,
      amounts,
      from,
      transferType = "standard",
      verification,
    } = input;
    const { auth } = context;

    // Determine if this is a batch operation
    const isBatch = recipients.length > 1;

    // Generate error message based on transfer type and batch mode
    const errorMessage =
      transferType === "forced"
        ? isBatch
          ? context.t("tokens:api.mutations.transfer.messages.batchForceFailed")
          : context.t("tokens:api.mutations.transfer.messages.forceFailed")
        : transferType === "transferFrom"
          ? context.t("tokens:api.mutations.transfer.messages.fromOwnerFailed")
          : isBatch
            ? context.t("tokens:api.mutations.transfer.messages.batchFailed")
            : context.t("tokens:api.mutations.transfer.messages.failed");

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
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });
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
            ...challengeResponse,
          },
          errorMessage
        );
      } else if (transferType === "forced") {
        // Forced batch transfer is supported
        if (!from || from.length === 0) {
          throw errors.INPUT_VALIDATION_FAILED({
            message: context.t(
              "tokens:api.mutations.transfer.messages.fromRequired"
            ),
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
            ...challengeResponse,
          },
          errorMessage
        );
      } else {
        // transferType === "transferFrom" - not supported in batch, must be done individually
        throw errors.INPUT_VALIDATION_FAILED({
          message: context.t(
            "tokens:api.mutations.transfer.messages.batchTransferFromNotSupported"
          ),
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
          message: context.t(
            "tokens:api.mutations.transfer.messages.missingRecipientOrAmount"
          ),
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
            ...challengeResponse,
          },
          errorMessage
        );
      } else if (transferType === "transferFrom") {
        if (!owner) {
          throw errors.INPUT_VALIDATION_FAILED({
            message: context.t(
              "tokens:api.mutations.transfer.messages.missingOwnerForTransferFrom"
            ),
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
            ...challengeResponse,
          },
          errorMessage
        );
      } else {
        // transferType === "forced"
        if (!owner) {
          throw errors.INPUT_VALIDATION_FAILED({
            message: context.t(
              "tokens:api.mutations.transfer.messages.missingOwnerForForced"
            ),
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
            ...challengeResponse,
          },
          errorMessage
        );
      }
    }

    // Return the updated token data using the read handler
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
