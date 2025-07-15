import { ALL_INTERFACE_IDS } from "@/lib/interface-ids";
import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { supportsInterface } from "@/orpc/helpers/interface-detection";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TokenApproveMessagesSchema } from "./token.approve.schema";

const TOKEN_APPROVE_ERC20_MUTATION = portalGraphql(`
  mutation TokenApproveERC20(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $spender: String!
    $amount: String!
  ) {
    approve: ERC20Approve(
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

const TOKEN_APPROVE_IERC3643_MUTATION = portalGraphql(`
  mutation TokenApproveIERC3643(
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

    // Check which interface to use for approve operation
    // Check for ERC20 first, then fall back to IERC3643
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
          "Token does not support approve operations. The token must implement IERC20 or IERC3643 interface.",
      });
    }

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    // Choose the appropriate mutation based on supported interfaces
    const mutation = supportsERC20
      ? TOKEN_APPROVE_ERC20_MUTATION
      : TOKEN_APPROVE_IERC3643_MUTATION;

    const transactionHash = yield* context.portalClient.mutate(
      mutation,
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
