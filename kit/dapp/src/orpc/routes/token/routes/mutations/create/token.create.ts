import { getFactoryTypeIdFromAssetType } from "@/lib/zod/validators/asset-types";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { tokenCreateHandlerMap } from "@/orpc/routes/token/routes/mutations/create/helpers/handler-map";

export const create = onboardedRouter.token.create
  .use(portalMiddleware)
  .use(systemMiddleware)
  .handler(async function* ({ input, context, errors }) {
    // TODO: middleware for this
    const tokenFactory = context.system.tokenFactories.find(
      (tokenFactory) =>
        tokenFactory.typeId === getFactoryTypeIdFromAssetType(input.type)
    );
    if (!tokenFactory) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Token factory context not set",
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
    });
  });
