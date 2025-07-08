import { getFactoryTypeIdFromAssetType } from "@/lib/zod/validators/asset-types";
import { handleChallenge } from "@/orpc/helpers/challenge-response";
import { tokenCreateHandlerMap } from "@/orpc/helpers/token/handler-map";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";

export const create = onboardedRouter.token.create
  .use(portalMiddleware)
  .use(systemMiddleware)
  .handler(async function* ({ input, context, errors }) {
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
