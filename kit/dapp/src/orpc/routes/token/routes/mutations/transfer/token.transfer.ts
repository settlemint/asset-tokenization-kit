import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
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

const ERC20_TRANSFER_MUTATION = portalGraphql(`
  mutation ERC20Transfer(
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

export const transfer = tokenRouter.token.transfer
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, recipients, amounts, verification } = input;
    const { auth } = context;

    // Determine if this is a batch operation
    const isBatch = recipients.length > 1;

    // Parse messages with defaults
    const messages = TokenTransferMessagesSchema.parse(input.messages ?? {});

    // Check which interface the token supports
    const [supportsERC20, supportsERC3643] = await Promise.all([
      supportsInterface(
        context.portalClient,
        contract,
        ALL_INTERFACE_IDS.IERC20
      ),
      supportsInterface(
        context.portalClient,
        contract,
        ALL_INTERFACE_IDS.IERC3643
      ),
    ]);

    if (!supportsERC20 && !supportsERC3643) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support transfer operations. The token must implement IERC20 or IERC3643 interface.",
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Choose the appropriate mutation based on single vs batch and interface support
    if (isBatch) {
      // Batch operations only supported by ERC3643
      if (!supportsERC3643) {
        throw errors.FORBIDDEN({
          message:
            "Token does not support batch transfer operations. The token must implement IERC3643 interface.",
        });
      }
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
    } else {
      // Single transfers - use ERC3643 if available, otherwise ERC20
      const mutation = supportsERC3643
        ? TOKEN_TRANSFER_MUTATION
        : ERC20_TRANSFER_MUTATION;

      const [to] = recipients;
      const [amount] = amounts;

      if (!to || !amount) {
        throw errors.INPUT_VALIDATION_FAILED({
          message: "Missing required recipient or amount",
          data: { errors: ["Invalid input data"] },
        });
      }

      const transactionHash = yield* context.portalClient.mutate(
        mutation,
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
    }
  });
