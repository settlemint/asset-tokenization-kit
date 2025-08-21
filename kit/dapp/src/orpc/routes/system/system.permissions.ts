import type { RoleRequirement } from "@atk/zod/role-requirement";

/**
 * System operation permission keys
 * 
 * These keys represent the logical operations in the system
 * and are used by middleware to check permissions.
 */
type SystemOperation = 
  | "tokenFactoryCreate"
  | "addonCreate"
  | "grantRole"
  | "revokeRole"
  | "complianceModuleCreate"
  | "identityRegister";

/**
 * The permissions for the system operations
 *
 * @description
 * This is a mapping of the system operation names to the roles that are required to call them.
 * Uses OR logic - user needs any of the listed roles.
 */
export const SYSTEM_PERMISSIONS: Record<
  SystemOperation,
  RoleRequirement
> = {
  tokenFactoryCreate: { any: ["systemManager"] },
  addonCreate: { any: ["addonManager", "systemManager"] },
  grantRole: { any: ["admin"] },
  revokeRole: { any: ["admin"] },
  complianceModuleCreate: { any: ["complianceManager", "systemManager"] },
  identityRegister: { any: ["identityManager", "systemManager"] },
};
