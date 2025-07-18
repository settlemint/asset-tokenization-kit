import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenFactoryPermissionMiddleware } from "@/orpc/middlewares/auth/token-factory-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { tokenCreateHandlerMap } from "@/orpc/routes/token/routes/mutations/create/helpers/handler-map";
import type { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

export const create = onboardedRouter.token.create
  .use(portalMiddleware)
  .use(systemMiddleware)
  .use(
    tokenFactoryPermissionMiddleware<typeof TokenCreateSchema>({
      requiredRoles: TOKEN_PERMISSIONS.create,
      getTokenType: (input) => input.type,
    })
  )
  .handler(async function* ({ input, context }) {
    const { tokenFactory } = context;

    const handler = tokenCreateHandlerMap[input.type];
    const challengeResponse = await handleChallenge(context.auth.user, {
      code: input.verification.verificationCode,
      type: input.verification.verificationType,
    });

    yield* handler(input, {
      mutationVariables: {
        address: tokenFactory.address,
        from: context.auth.user.wallet,
        ...challengeResponse,
      },
      portalClient: context.portalClient,
    });
  });
