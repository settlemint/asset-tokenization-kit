import { tokenFactoryPermissionMiddleware } from "@/orpc/middlewares/auth/token-factory-permission.middleware";
import { portalMiddleware } from "@/orpc/middlewares/services/portal.middleware";
import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import { PredictAddressInputSchema } from "@/orpc/routes/token/routes/factory/factory.predict-address.schema";
import { predictAddressHandlerMap } from "@/orpc/routes/token/routes/factory/helpers/predict-handlers/handler-map";

export const factoryPredictAddress = onboardedRouter.token.factoryPredictAddress
  .use(portalMiddleware)
  .use(systemMiddleware)
  .use(
    tokenFactoryPermissionMiddleware<typeof PredictAddressInputSchema>({
      requiredRoles: [],
      getTokenType: (input) => input.type,
    })
  )
  .handler(async ({ input, context }) => {
    const { tokenFactory } = context;

    const handler = predictAddressHandlerMap[input.type];

    return handler(input, {
      factoryAddress: tokenFactory.address,
      portalClient: context.portalClient,
    });
  });
