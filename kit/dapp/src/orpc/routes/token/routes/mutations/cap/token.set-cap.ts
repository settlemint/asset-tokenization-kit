import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { getMutationMessages } from "@/orpc/helpers/mutation-messages";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

const TOKEN_SET_CAP_MUTATION = portalGraphql(`
  mutation TokenSetCap(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
    $newCap: String!
  ) {
    setCap: ISMARTCappedSetCap(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
      input: {
        newCap: $newCap
      }
    ) {
      transactionHash
    }
  }
`);

export const setCap = tokenRouter.token.setCap
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.setCap,
      requiredExtensions: ["CAPPED"],
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, verification, newCap } = input;
    const { auth, t } = context;

    // Generate messages using server-side translations
    const { pendingMessage, successMessage, errorMessage } =
      getMutationMessages(t, "tokens", "setCap");

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_SET_CAP_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        newCap: newCap.toString(),
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
