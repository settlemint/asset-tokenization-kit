import type { AccessControlRoles } from "@/lib/fragments/the-graph/access-control-fragment";
import type { TokenExtensions } from "@/orpc/middlewares/system/token.middleware";
import { baseRouter } from "@/orpc/procedures/base.router";

/**
 * Middleware to check if
 * - The user is compliant with the token's required claim topics.
 * - The user has the required roles to interact with the token.
 * - The user is allowed to interact with the token. (eg not in the blocked list or blocked countries list)
 * @param requiredRoles - The roles required to interact with the token.
 * @param requiredExtensions - The extensions required to interact with the token.
 * @returns The middleware function.
 */
export function tokenPermissionMiddleware({
  requiredRoles,
  requiredExtensions,
}: {
  requiredRoles?: AccessControlRoles[];
  requiredExtensions?: TokenExtensions[];
}) {
  return baseRouter.middleware(async ({ context, next, errors }) => {
    const { token } = context;

    if (!token) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Token context not set",
      });
    }

    if (!token.implementsERC3643 && !token.implementsSMART) {
      throw errors.TOKEN_INTERFACE_NOT_SUPPORTED({
        data: {
          requiredInterfaces: ["ERC3643 or SMART"],
        },
      });
    }

    if (
      Array.isArray(requiredExtensions) &&
      !requiredExtensions.every((extension) =>
        token.extensions.includes(extension)
      )
    ) {
      throw errors.TOKEN_INTERFACE_NOT_SUPPORTED({
        data: {
          requiredInterfaces: requiredExtensions,
        },
      });
    }

    if (!token.userPermissions) {
      throw errors.FORBIDDEN({
        message: "User permissions not available",
      });
    }

    if (!token.userPermissions.isCompliant) {
      throw errors.USER_NOT_COMPLIANT({
        data: {
          requiredClaimTopics: token.requiredClaimTopics,
        },
      });
    }

    if (!token.userPermissions.isAllowed) {
      throw errors.USER_NOT_ALLOWED({
        data: {
          reason: token.userPermissions.notAllowedReason ?? "Unknown",
        },
      });
    }

    if (
      Array.isArray(requiredRoles) &&
      !requiredRoles.every(
        (requiredRole) => !token.userPermissions?.roles[requiredRole]
      )
    ) {
      throw errors.USER_NOT_AUTHORIZED({
        data: {
          requiredRoles,
        },
      });
    }

    return next();
  });
}
