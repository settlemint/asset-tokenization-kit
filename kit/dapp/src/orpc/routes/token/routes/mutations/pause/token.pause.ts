import { portalGraphql } from "@/lib/settlemint/portal";
import { getEthereumHash } from "@/lib/zod/validators/ethereum-hash";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

const TOKEN_PAUSE_MUTATION = portalGraphql(`
  mutation TokenPause(
    $verificationId: String
    $challengeResponse: String
    $address: String!
    $from: String!
  ) {
    pause: ISMARTPausablePause(
      address: $address
      from: $from
      verificationId: $verificationId
      challengeResponse: $challengeResponse
    ) {
      transactionHash
    }
  }
`);

export const pause = tokenRouter.token.pause
  .use(
    tokenPermissionMiddleware({
      requiredRoles: TOKEN_PERMISSIONS.pause,
      requiredExtensions: ["PAUSABLE"],
    })
  )
  .use(portalMiddleware)
  .handler(async function* ({ input, context }) {
    const { contract, verification } = input;
    const { auth, t } = context;

    // Generate messages using server-side translations
    const pendingMessage = t("tokens:actions.pause.messages.preparing");
    const successMessage = t("tokens:actions.pause.messages.success");
    const errorMessage = t("tokens:actions.pause.messages.failed");

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    const transactionHash = yield* context.portalClient.mutate(
      TOKEN_PAUSE_MUTATION,
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
