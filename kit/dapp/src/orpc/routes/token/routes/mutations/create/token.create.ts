import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalRouter } from "@/orpc/procedures/portal.router";
import { getTokenFactory } from "@/orpc/routes/token/routes/factory/helpers/factory-context";
import { tokenCreateHandlerMap } from "@/orpc/routes/token/routes/mutations/create/helpers/handler-map";
import type {
  TokenCreateOutput,
  TokenCreateSchema,
} from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

export const create = portalRouter.token.create
  .use(
    blockchainPermissionsMiddleware<typeof TokenCreateSchema>({
      requiredRoles: TOKEN_PERMISSIONS.create,
      getAccessControl: ({ context, input }) => {
        const tokenFactory = getTokenFactory(context, input.type);
        return tokenFactory?.accessControl;
      },
    })
  )
  .handler(async function* ({
    input,
    context,
    errors,
  }): AsyncGenerator<TokenCreateOutput> {
    const tokenFactory = getTokenFactory(context, input.type);
    if (!tokenFactory) {
      throw errors.NOT_FOUND({
        message: `Token factory for type ${input.type} not found`,
      });
    }

    const handler = tokenCreateHandlerMap[input.type];
    const challengeResponse = await handleChallenge(context.auth.user, {
      code: input.verification.verificationCode,
      type: input.verification.verificationType,
    });

    yield* handler(input, {
      mutationVariables: {
        address: tokenFactory.id,
        from: context.auth.user.wallet,
        ...challengeResponse,
      },
      portalClient: context.portalClient,
      t: context.t,
    });
  });
