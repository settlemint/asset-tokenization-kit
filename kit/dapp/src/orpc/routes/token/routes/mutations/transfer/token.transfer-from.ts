import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenTransferMessagesSchema } from "@/orpc/routes/token/routes/mutations/transfer/token.transfer.schema";

const TOKEN_TRANSFER_FROM_MUTATION = portalGraphql(`
  mutation TokenTransferFrom(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $sender: String!
    $to: String!
    $amount: String!
  ) {
    transferFrom: IERC3643TransferFrom(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        from: $sender
        to: $to
        value: $amount
      }
    ) {
      transactionHash
    }
  }
`);

const ERC20_TRANSFER_FROM_MUTATION = portalGraphql(`
  mutation ERC20TransferFrom(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $sender: String!
    $to: String!
    $amount: String!
  ) {
    transferFrom: IERC3643TransferFrom(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        from: $sender
        to: $to
        value: $amount
      }
    ) {
      transactionHash
    }
  }
`);

export const transferFrom = tokenRouter.token.transferFrom
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, from, recipients, amounts, verification } = input;
    const { auth } = context;

    // Check if this is a batch operation (not supported for transferFrom)
    if (from.length > 1 || recipients.length > 1) {
      throw errors.INPUT_VALIDATION_FAILED({
        message:
          "Batch transferFrom operations are not supported. Please use single transfers only.",
        data: {
          errors: ["TransferFrom does not support batch operations"],
        },
      });
    }

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
          "Token does not support transferFrom operations. The token must implement IERC20 or IERC3643 interface.",
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Use ERC3643 if available (it's more feature-rich), otherwise fall back to ERC20
    const mutation = supportsERC3643
      ? TOKEN_TRANSFER_FROM_MUTATION
      : ERC20_TRANSFER_FROM_MUTATION;

    const [senderAddress] = from;
    const [to] = recipients;
    const [amount] = amounts;

    if (!senderAddress || !to || !amount) {
      throw errors.INPUT_VALIDATION_FAILED({
        message: "Missing required sender, recipient, or amount",
        data: { errors: ["Invalid input data"] },
      });
    }

    const transactionHash = yield* context.portalClient.mutate(
      mutation,
      {
        address: contract,
        from: sender.wallet, // The user executing the transaction
        sender: senderAddress, // The address whose tokens are being transferred
        to,
        amount: amount.toString(),
        ...challengeResponse,
      },
      messages.transferFailed,
      messages
    );
    return getEthereumHash(transactionHash);
  });
