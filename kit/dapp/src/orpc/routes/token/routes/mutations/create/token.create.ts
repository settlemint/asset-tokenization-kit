import {
  getFactoryTypeIdFromAssetType,
  type AssetType,
} from "@/lib/zod/validators/asset-types";
import type { Context } from "@/orpc/context/context";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { blockchainPermissionsMiddleware } from "@/orpc/middlewares/auth/blockchain-permissions.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { tokenCreateHandlerMap } from "@/orpc/routes/token/routes/mutations/create/helpers/handler-map";
import type { TokenCreateSchema } from "@/orpc/routes/token/routes/mutations/create/token.create.schema";
import { TOKEN_PERMISSIONS } from "@/orpc/routes/token/token.permissions";

function getTokenFactory(context: Context, type: AssetType) {
  return context.system?.tokenFactories.find(
    (tokenFactory) =>
      tokenFactory.typeId === getFactoryTypeIdFromAssetType(type)
  );
}

export const create = onboardedRouter.token.create
  .use(portalMiddleware)
  .use(systemMiddleware)
  .use(
    blockchainPermissionsMiddleware<typeof TokenCreateSchema>({
      requiredRoles: TOKEN_PERMISSIONS.create,
      getAccessControl: ({ context, input }) => {
        const tokenFactory = getTokenFactory(context, input.type);
        return tokenFactory?.accessControl;
      },
    })
  )
  .handler(async function* ({ input, context, errors }) {
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
        address: tokenFactory.address,
        from: context.auth.user.wallet,
        ...challengeResponse,
      },
      portalClient: context.portalClient,
      t: context.t,
    });
  });
