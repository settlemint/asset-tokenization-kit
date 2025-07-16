import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenApproveMessagesSchema } from "./token.approve.schema";

const TOKEN_APPROVE_MUTATION = portalGraphql(`
  mutation TokenApprove(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $spender: String!
    $amount: String!
  ) {
    approve: IERC3643Approve(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        spender: $spender
        amount: $amount
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenApprove = tokenRouter.token.tokenApprove
  .use(portalMiddleware)
  .handler(async function* ({ input, context, errors }) {
    const { contract, verification, spender, amount } = input;
    const { auth } = context;

    // Parse messages with defaults
    const messages = TokenApproveMessagesSchema.parse(input.messages ?? {});

    // Validate that the token supports ERC3643 interface
    const supportsERC3643 = await supportsInterface(
      context.portalClient,
      contract,
      ALL_INTERFACE_IDS.IERC3643
    );

    if (!supportsERC3643) {
      throw errors.FORBIDDEN({
        message:
          "Token does not support approve operations. The token must implement IERC3643 interface.",
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_APPROVE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        spender,
        amount: amount.toString(),
        ...challengeResponse,
      },
      messages.approvalFailed,
      messages
    );

    return getEthereumHash(transactionHash);
  });
