import type { SystemAccessControl } from "@/orpc/middlewares/system/system.middleware";
import { baseRouter } from "@/orpc/procedures/base.router";

/**
 * Middleware to check if the user has the required permission to interact with the token factory.
 * @param type - The type of the token factory.
 * @param requiredPermission - The permission required to interact with the token factory.
 * @param requiredRoles
 * @returns The middleware function.
 */
export const tokenFactoryPermissionMiddleware = (
  requiredRoles: (keyof SystemAccessControl)[]
) =>
  baseRouter.middleware(async ({ context, next, errors }) => {
    const { auth, tokenFactory } = context;

    if (!tokenFactory) {
      throw errors.SYSTEM_NOT_CREATED();
    }

    const userRoles = auth
      ? Object.entries(tokenFactory.accessControl)
          .filter(([, accounts]) =>
            accounts.some((account) => account.id === auth.user.wallet)
          )
          .map(([role]) => role as keyof typeof tokenFactory.accessControl)
      : [];

    if (!userRoles.some((role) => requiredRoles.includes(role))) {
      throw errors.FORBIDDEN();
    }

    return next();
  });
