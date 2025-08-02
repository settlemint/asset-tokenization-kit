import type { RoleRequirement } from "@/lib/zod/validators/role-requirement";

/**
 * The permissions for the token factory contract
 *
 * @description
 * This is a mapping of the token factory contract methods to the roles that are required to call them.
 * Uses OR logic - user needs either tokenManager OR systemManager role.
 */
export const TOKEN_FACTORY_PERMISSIONS: Record<"create", RoleRequirement> = {
  create: { any: ["tokenManager", "systemManager"] },
};
