import { type TokenRoles } from "@/orpc/middlewares/system/token.middleware";
import { baseRouter } from "@/orpc/procedures/base.router";

/**
 * Middleware to check if
 * - The user is compliant with the token's required claim topics.
 * - The user has the required roles to interact with the token.
 *
 * @param requiredRoles - The roles required to interact with the token.
 * @returns The middleware function.
 */
export function tokenPermissionMiddleware({
  requiredRoles,
}: {
  requiredRoles?: TokenRoles[];
}) {
  return baseRouter.middleware(async ({ context, next, errors }) => {
    const { token } = context;

    if (!token) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Token context not set",
      });
    }

    if (!token.userPermissions.isCompliant) {
      throw errors.FORBIDDEN();
    }

    for (const requiredRole of requiredRoles ?? []) {
      if (!token.userPermissions.roles[requiredRole]) {
        throw errors.FORBIDDEN();
      }
    }

    return next();
  });
}
