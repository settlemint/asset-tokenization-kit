import type { AssetType } from "@/lib/zod/validators/asset-types";
import { baseRouter } from "@/orpc/procedures/base.router";

/**
 * Middleware to inject the token factory into the context.
 * @param type - The type of the token factory.
 * @returns The middleware function.
 */
export const tokenFactoryMiddleware = (type: AssetType) =>
  baseRouter.middleware(async ({ context, next, errors }) => {
    const { system } = context;
    if (!system) {
      throw errors.SYSTEM_NOT_CREATED();
    }

    // TODO: This is a temporary solution to map the token factory name to the asset type
    const tokenFactoryNamesMap: Record<string, AssetType> = {
      Funds: "fund",
      Equities: "equity",
      Bonds: "bond",
      Stablecoins: "stablecoin",
      Deposits: "deposit",
    };

    const tokenFactory = system.tokenFactories.find(
      (tokenFactory) => tokenFactoryNamesMap[tokenFactory.name] === type
    );
    if (!tokenFactory) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Token factory context not set",
      });
    }

    return next({
      context: {
        tokenFactory,
      },
    });
  });
