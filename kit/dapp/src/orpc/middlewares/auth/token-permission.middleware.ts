import type { TokenRoles } from "@/orpc/middlewares/system/token.middleware";
import { baseRouter } from "@/orpc/procedures/base.router";

/**
 * Middleware to check if the user has the required permission to interact with the token factory.
 * @param type - The type of the token factory.
 * @param requiredPermission - The permission required to interact with the token factory.
 * @returns The middleware function.
 */
export const tokenPermissionMiddleware = ({
  requiredRoles,
  requiredClaims,
}: {
  requiredRoles?: TokenRoles[];
  requiredClaims?: string[];
}) =>
  baseRouter.middleware(async ({ context, next, errors }) => {
    const { token } = context;

    if (!token) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Token context not set",
      });
    }

    for (const requiredRole of requiredRoles ?? []) {
      if (!token.userHasRole[requiredRole]) {
        throw errors.FORBIDDEN();
      }
    }

    return next();
  });
