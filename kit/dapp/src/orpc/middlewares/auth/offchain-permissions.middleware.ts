import { authClient } from "@/lib/auth/auth.client";
import type { Permissions } from "@/lib/auth/utils/permissions";
import type { Context } from "@/orpc/context/context";
import { baseRouter } from "@/orpc/procedures/base.router";
import * as z from "zod";

interface OffChainPermissionsMiddlewareOptions<InputSchema extends z.ZodType> {
  requiredPermissions: Partial<Permissions>;
  alwaysAllowIf?: (
    context: Pick<Context, "auth">,
    input: z.infer<InputSchema>
  ) => boolean;
}

export const offChainPermissionsMiddleware = <InputSchema extends z.ZodType>({
  requiredPermissions,
  alwaysAllowIf = () => false,
}: OffChainPermissionsMiddlewareOptions<InputSchema>) =>
  baseRouter.middleware(async ({ context, next, errors }, input) => {
    if (!context.auth) {
      throw errors.UNAUTHORIZED();
    }

    if (alwaysAllowIf(context, input as z.infer<InputSchema>)) {
      return next();
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
