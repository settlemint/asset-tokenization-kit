import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { validateBatchArrays } from "@/orpc/helpers/array-validation";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenTransferMessagesSchema } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer.schema";

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
  .handler(async function* ({ input, context, errors }) {
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

    // Parse messages with defaults
    const messages = TokenTransferMessagesSchema.parse(input.messages ?? {});

    // Validate that the token supports ERC3643 (we only support ERC3643 tokens)
    const supportsERC3643 = await supportsInterface(
      context.portalClient,
      contract,
      ALL_INTERFACE_IDS.IERC3643
    );

    if (!supportsERC3643) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support transfer operations. The token must implement IERC3643 interface.",
      });
    }

    // For forced transfers, check custodian interface
    if (transferType === "forced") {
      const supportsCustodian = await supportsInterface(
        context.portalClient,
        contract,
        ALL_INTERFACE_IDS.ISMARTCustodian
      );

      if (!supportsCustodian) {
        throw errors.FORBIDDEN({
          message:
            "Token does not support forced transfer operations. The token must implement ISMARTCustodian interface.",
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

        const transactionHash = yield* context.portalClient.mutate(
          TOKEN_BATCH_TRANSFER_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            recipients,
            amounts: amounts.map((a) => a.toString()),
            ...challengeResponse,
          },
          messages.transferFailed,
          messages
        );
        return getEthereumHash(transactionHash);
      } else if (transferType === "forced") {
        // Forced batch transfer is supported
        if (!from || from.length === 0) {
          throw errors.INPUT_VALIDATION_FAILED({
            message: "From addresses are required for forced batch transfers",
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

        const transactionHash = yield* context.portalClient.mutate(
          TOKEN_BATCH_FORCED_TRANSFER_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            fromList: from,
            toList: recipients,
            amounts: amounts.map((a) => a.toString()),
            ...challengeResponse,
          },
          messages.transferFailed,
          messages
        );
        return getEthereumHash(transactionHash);
      } else {
        // transferType === "transferFrom" - not supported in batch, must be done individually
        throw errors.INPUT_VALIDATION_FAILED({
          message:
            "Batch transferFrom operations are not supported. Use individual transfers instead.",
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
          message: "Missing required recipient or amount",
          data: { errors: ["Invalid input data"] },
        });
      }

      if (transferType === "standard") {
        const transactionHash = yield* context.portalClient.mutate(
          TOKEN_TRANSFER_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            to,
            amount: amount.toString(),
            ...challengeResponse,
          },
          messages.transferFailed,
          messages
        );
        return getEthereumHash(transactionHash);
      } else if (transferType === "transferFrom") {
        if (!owner) {
          throw errors.INPUT_VALIDATION_FAILED({
            message: "Missing required owner address for transferFrom",
            data: { errors: ["Invalid input data"] },
          });
        }
        const transactionHash = yield* context.portalClient.mutate(
          TOKEN_TRANSFER_FROM_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            owner,
            to,
            amount: amount.toString(),
            ...challengeResponse,
          },
          messages.transferFailed,
          messages
        );
        return getEthereumHash(transactionHash);
      } else {
        // transferType === "forced"
        if (!owner) {
          throw errors.INPUT_VALIDATION_FAILED({
            message: "Missing required owner address for forced transfer",
            data: { errors: ["Invalid input data"] },
          });
        }
        const transactionHash = yield* context.portalClient.mutate(
          TOKEN_FORCED_TRANSFER_MUTATION,
          {
            address: contract,
            from: sender.wallet,
            owner,
            to,
            amount: amount.toString(),
            ...challengeResponse,
          },
          messages.transferFailed,
          messages
        );
        return getEthereumHash(transactionHash);
      }
    }
  });
