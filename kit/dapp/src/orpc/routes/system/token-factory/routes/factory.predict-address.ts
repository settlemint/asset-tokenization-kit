import { systemRouter } from "@/orpc/procedures/system.router";
import { getTokenFactory } from "@/orpc/routes/system/token-factory/helpers/factory-context";
import { predictAddressHandlerMap } from "@/orpc/routes/system/token-factory/helpers/predict-handlers/handler-map";

export const factoryPredictAddress =
  systemRouter.system.tokenFactoryPredictAddress.handler(
    ({ input, context, errors }) => {
      const tokenFactory = getTokenFactory(context, input.type);
      if (!tokenFactory) {
        throw errors.NOT_FOUND({
          message: `Token factory for type ${input.type} not found`,
        });
      }

      const handler = predictAddressHandlerMap[input.type];

      return handler(input, {
        factoryAddress: tokenFactory.id,
        portalClient: context.portalClient,
      });
    }
  );
