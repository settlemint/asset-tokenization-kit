import { systemMiddleware } from "@/orpc/middlewares/system/system.middleware";
import { onboardedRouter } from "@/orpc/procedures/onboarded.router";
import type { AvailableOutput } from "@/orpc/routes/system/token-factory/routes/factory.available.schema";
import { factoryPredictAddress } from "@/orpc/routes/system/token-factory/routes/factory.predict-address";
import { search as tokenSearch } from "@/orpc/routes/token/routes/token.search";
import type { EthereumAddress } from "@atk/zod/ethereum-address";
import { call } from "@orpc/server";

/**
 * ORPC handler for checking token address availability.
 *
 * @param input - Token creation parameters (same as predict address)
 * @param context - ORPC context with auth, system, and service clients
 * @returns Object with predicted address and availability boolean
 * @throws INTERNAL_SERVER_ERROR When prediction or search fails
 */
export const factoryAvailable = onboardedRouter.system.factory.available
  .use(systemMiddleware)
  .handler(async ({ input, context }): Promise<AvailableOutput> => {
    let address: EthereumAddress;
    if ("address" in input) {
      address = input.address;
    } else {
      const { predictedAddress } = await call(
        factoryPredictAddress,
        input.parameters,
        {
          context,
        }
      );
      address = predictedAddress;
    }

    const searchResult = await call(
      tokenSearch,
      {
        query: address,
        limit: 1,
      },
      { context }
    );

    return {
      isAvailable: searchResult.length === 0,
    };
  });
