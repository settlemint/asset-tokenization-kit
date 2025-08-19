import { portalRouter } from "../../../../procedures/portal.router";
import { getTokenFactory } from "../helpers/factory-context";
import { predictAddressHandlerMap } from "../helpers/predict-handlers/handler-map";
import type { AssetType } from "@atk/zod/validators/asset-types";

export const factoryPredictAddress =
  portalRouter.system.tokenFactoryPredictAddress.handler(
    ({ input, context, errors }) => {
      const tokenFactory = getTokenFactory(context, input.type);
      if (!tokenFactory) {
        throw errors.NOT_FOUND({
          message: `Token factory for type ${input.type} not found`,
        });
      }

      const handler = predictAddressHandlerMap[input.type as AssetType];

      return handler(input, {
        factoryAddress: tokenFactory.id,
        portalClient: context.portalClient,
      });
    }
  );
