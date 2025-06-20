import { authClient } from "@/lib/auth/auth.client";
import type { Permissions } from "@/lib/auth/permissions";
import { baseRouter } from "@/orpc/procedures/base.router";

export const permissionsMiddleware = (
  requiredPermissions: Partial<Permissions>
) =>
  baseRouter.middleware(async ({ context, next, errors }) => {
    if (!context.auth) {
      throw errors.UNAUTHORIZED();
    }

    const hasPermission = authClient.admin.checkRolePermission({
      permission: requiredPermissions,
      role: context.auth.user.role,
    });
    if (!hasPermission) {
      throw errors.FORBIDDEN();
    }

    return next();
  });
