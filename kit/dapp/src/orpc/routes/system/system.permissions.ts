import type { systemContract } from "@/orpc/routes/system/system.contract";
import type { RoleRequirement } from "@atk/zod/role-requirement";

/**
 * Type-safe compile-time checks to ensure the nested contract structure contains
 * the expected operations. These types will cause compilation errors if the
 * contract structure changes, helping catch refactoring issues early.
 */
type FactoryOperations = keyof typeof systemContract.factory;
type AddonOperations = keyof typeof systemContract.addon;
type AccessManagerOperations = keyof typeof systemContract.accessManager;
type ComplianceOperations = keyof typeof systemContract.compliance;
type IdentityOperations = keyof typeof systemContract.identity;

// Create a type that uses all the operation checks
type SystemContractValidation = {
  factoryHasCreate: "create" extends FactoryOperations ? true : never;
  addonHasCreate: "create" extends AddonOperations ? true : never;
  accessManagerHasGrantRole: "grantRole" extends AccessManagerOperations
    ? true
    : never;
  accessManagerHasRevokeRole: "revokeRole" extends AccessManagerOperations
    ? true
    : never;
  complianceHasCreate: "create" extends ComplianceOperations ? true : never;
  identityHasRegister: "register" extends IdentityOperations ? true : never;
};

// This type will cause a compile error if any operation is missing
type AssertValidContract =
  SystemContractValidation extends Record<string, true> ? true : never;

/**
 * The permissions for the system operations
 *
 * @description
 * This is a mapping of the system operation names to the roles that are required to call them.
 * Uses OR logic - user needs any of the listed roles.
 *
 * The keys are flat names for clarity and backward compatibility with middleware,
 * but they map to nested contract methods:
 * - tokenFactoryCreate -> system.factory.create
 * - addonCreate -> system.addon.create
 * - grantRole -> system.accessManager.grantRole
 * - revokeRole -> system.accessManager.revokeRole
 * - complianceModuleCreate -> system.compliance.create
 * - identityRegister -> system.identity.register
 *
 * The SystemContractValidation type above ensures these mappings stay valid during refactoring.
 */
export const SYSTEM_PERMISSIONS = {
  tokenFactoryCreate: { any: ["systemManager"] },
  tokenCreate: "tokenManager",
  addonFactoryCreate: { any: ["addonManager", "systemManager"] },
  addonCreate: "addonManager",
  grantRole: { any: ["admin"] },
  revokeRole: { any: ["admin"] },
  complianceModuleCreate: { any: ["complianceManager", "systemManager"] },
  identityRegister: { any: ["identityManager", "systemManager"] },
  identityList: { any: ["identityManager", "claimIssuer", "systemModule"] },
  trustedIssuerCreate: { any: ["claimPolicyManager", "systemModule"] },
  trustedIssuerUpdate: { any: ["claimPolicyManager", "systemModule"] },
  trustedIssuerDelete: { any: ["claimPolicyManager", "systemModule"] },
  topicCreate: { any: ["claimPolicyManager", "systemModule"] },
  topicUpdate: { any: ["claimPolicyManager", "systemModule"] },
  topicDelete: { any: ["claimPolicyManager", "systemModule"] },
  claimCreate: { any: ["claimIssuer", "systemModule"] },
  claimList: { any: ["identityManager", "claimIssuer"] },
  claimRevoke: { any: ["claimIssuer", "systemModule"] },
} as const satisfies Record<string, RoleRequirement>;

// Use the validation type to ensure it's not stripped
export type _SystemContractIsValid = AssertValidContract;
