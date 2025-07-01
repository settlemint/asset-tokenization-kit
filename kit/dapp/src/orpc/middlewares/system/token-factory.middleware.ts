import type { AssetFactoryTypeId } from "@/lib/zod/validators/asset-types";
import { baseRouter } from "@/orpc/procedures/base.router";

/**
 * Middleware to inject the token factory into the context.
 * @param type - The type of the token factory.
 * @returns The middleware function.
 */
export const tokenFactoryMiddleware = (typeId: AssetFactoryTypeId) =>
  baseRouter.middleware(async ({ context, next, errors }) => {
    const { system } = context;
    if (!system) {
      throw errors.SYSTEM_NOT_CREATED();
    }

    const tokenFactory = system.tokenFactories.find(
      (tokenFactory) => tokenFactory.typeId === typeId
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
