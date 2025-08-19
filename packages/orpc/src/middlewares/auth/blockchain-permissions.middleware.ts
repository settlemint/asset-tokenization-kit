import type { AccessControl } from "@atk/auth/fragments/the-graph/access-control-fragment";
import type { RoleRequirement } from "@atk/zod/validators/role-requirement";
import { satisfiesRoleRequirement } from "@atk/zod/validators/role-requirement";
import type { z } from "zod";
import type { Context } from "@/context/context";
import { getUserRoles } from "@/helpers/access-control-helpers";
import { baseRouter } from "@/procedures/base.router";

/**
 * Middleware to check if the user has the required permission to interact with blockchain.
 * @param requiredRoles - The roles required to interact with blockchain. Supports complex AND/OR logic.
 * @param getAccessControl - The function to get the access control from the input.
 * @returns The middleware function.
 */
export const blockchainPermissionsMiddleware = <InputSchema extends z.ZodType>({
  requiredRoles,
  getAccessControl,
}: {
  requiredRoles: RoleRequirement;
  getAccessControl: (data: { context: Context; input: z.infer<InputSchema> }) => AccessControl | undefined;
}) =>
  baseRouter.middleware(({ context, next, errors }, input) => {
    const { auth, system } = context;

    if (!system) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "System context not set",
      });
    }

    const accessControl = getAccessControl({
      context,
      input: input as z.infer<InputSchema>,
    });

    if (!accessControl) {
      throw errors.INTERNAL_SERVER_ERROR({
        message: "Access control not set",
      });
    }

    // Use type-safe helper to get user roles
    const userRoles = auth ? getUserRoles(auth.user.wallet, accessControl) : [];

    // Check if user satisfies the role requirement (supports AND/OR logic)
    if (!satisfiesRoleRequirement(userRoles, requiredRoles)) {
      throw errors.USER_NOT_AUTHORIZED({
        data: {
          requiredRoles,
        },
      });
    }

    return next();
  });
