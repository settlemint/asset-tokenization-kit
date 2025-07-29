import { portalGraphql } from "@/lib/settlemint/portal";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenPermissionMiddleware } from "@/orpc/middlewares/auth/token-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { tokenMiddleware } from "@/orpc/middlewares/system/token.middleware";
import { tokenRouter } from "@/orpc/procedures/token.router";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";
import { read } from "../../token.read";
import { call } from "@orpc/server";

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
      ethereumHash: transactionHash
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
  .use(tokenMiddleware)
  .handler(async ({ input, context }) => {
    const { contract, verification } = input;
    const { auth } = context;

    const sender = auth.user;
    const challengeResponse = await handleChallenge(sender, {
      code: verification.verificationCode,
      type: verification.verificationType,
    });

    await context.portalClient.mutate(
      TOKEN_PAUSE_MUTATION,
      {
        address: contract,
        from: sender.wallet,
        ...challengeResponse,
      },
      context.t("tokens:actions.pause.messages.failed")
    );

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
