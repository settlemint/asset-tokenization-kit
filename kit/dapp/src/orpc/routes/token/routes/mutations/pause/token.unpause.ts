import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

const TOKEN_UNPAUSE_MUTATION = portalGraphql(`
  mutation TokenUnpause(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    unpause: ISMARTPausableUnpause(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const unpause = tokenRouter.token.unpause
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.unpause,
      requiredExtensions: ["PAUSABLE"],
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, verification } = input;
    const { auth, t } = context;

    // Generate messages using server-side translations
    const pendingMessage = t("tokens:actions.unpause.messages.preparing");
    const successMessage = t("tokens:actions.unpause.messages.success");
    const errorMessage = t("tokens:actions.unpause.messages.failed");

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_UNPAUSE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
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
