import type { RoleRequirement } from "@/lib/zod/validators/role-requirement";
import type { systemContract } from "@/orpc/routes/system/system.contract";

type SystemContractMutations = keyof Pick<
  typeof systemContract,
  | "tokenFactoryCreate"
  | "addonCreate"
  | "grantRole"
  | "revokeRole"
  | "complianceModuleCreate"
  | "identityRegister"
>;

/**
 * The permissions for the token factory contract
 *
 * @description
 * This is a mapping of the token factory contract methods to the roles that are required to call them.
 * Uses OR logic - user needs either tokenManager OR systemManager role.
 */
export const SYSTEM_PERMISSIONS: Record<
  SystemContractMutations,
  RoleRequirement
> = {
  tokenFactoryCreate: { any: ["systemManager"] },
  addonCreate: { any: ["addonManager", "systemManager"] },
  grantRole: { any: ["admin"] },
  revokeRole: { any: ["admin"] },
  complianceModuleCreate: { any: ["complianceManager", "systemManager"] },
  identityRegister: { any: ["identityManager", "systemManager"] },
};
