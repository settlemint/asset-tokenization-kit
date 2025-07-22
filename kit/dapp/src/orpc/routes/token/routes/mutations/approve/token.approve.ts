import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { getMutationMessages } from "@/orpc/helpers/mutation-messages";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

const TOKEN_APPROVE_MUTATION = portalGraphql(`
  mutation TokenApprove(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $spender: String!
    $amount: String!
  ) {
    approve: SMARTApprove(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        spender: $spender
        value: $amount
      }
    ) {
      transactionHash
    }
  }
`);

export const tokenApprove = tokenRouter.token.tokenApprove
  .use(portalMiddleware)
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.tokenApprove,
    })
  )
  .handler(async function* ({ input, context }) {
    const { contract, verification, spender, amount } = input;
    const { auth, t } = context;

    // Generate messages using server-side translations
    const { pendingMessage, successMessage, errorMessage } =
      getMutationMessages(t, "tokens", "approve");

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
      errorMessage,
      {
        waitingForMining: pendingMessage,
        transactionIndexed: successMessage,
      }
    );

    return getEthereumHash(transactionHash);
  });
