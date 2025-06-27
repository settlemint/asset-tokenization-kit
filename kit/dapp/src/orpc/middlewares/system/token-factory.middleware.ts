import type { AssetType } from '@/lib/zod/validators/asset-types';
import { baseRouter } from '@/orpc/procedures/base.router';

/**
 * Middleware to inject the token factory into the context.
 * @param type - The type of the token factory.
 * @returns The middleware function.
 */
export const tokenFactoryMiddleware = (type: AssetType) =>
  baseRouter.middleware(({ context, next, errors }) => {
    const { system } = context;
    if (!system) {
      throw errors.SYSTEM_NOT_CREATED();
    }

    const tokenFactory = system.tokenFactories.find(
      (factory) => factory.type === type
    );
    if (!tokenFactory) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: 'Token factory context not set',
      });
    }

    return next({
      context: {
        tokenFactory,
      },
    });
  });
