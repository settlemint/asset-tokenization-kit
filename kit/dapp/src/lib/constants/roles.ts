import type { AccessControlRoles } from "@atk/zod/access-control-roles";
import { encodePacked, keccak256 } from "viem";

/**
 * Role configuration for the ATK system
 * Calculates role hashes using keccak256 for consistency with smart contracts
 */
export class RoleConfig {
  readonly name: string;
  readonly bytes: `0x${string}`;
  readonly fieldName: AccessControlRoles;

  constructor(name: string, fieldName: AccessControlRoles) {
    this.name = name;
    this.fieldName = fieldName;

    // DEFAULT_ADMIN_ROLE is always 0x00...
    this.bytes =
      name === "DEFAULT_ADMIN_ROLE"
        ? "0x0000000000000000000000000000000000000000000000000000000000000000"
        : keccak256(encodePacked(["string"], [name]));
  }
}

// --- Core Admin Role ---
export const DEFAULT_ADMIN_ROLE = new RoleConfig("DEFAULT_ADMIN_ROLE", "admin");

// --- People Roles (ATKPeopleRoles) ---
export const SYSTEM_MANAGER_ROLE = new RoleConfig(
  "SYSTEM_MANAGER_ROLE",
  "systemManager"
);
export const IDENTITY_MANAGER_ROLE = new RoleConfig(
  "IDENTITY_MANAGER_ROLE",
  "identityManager"
);
export const TOKEN_MANAGER_ROLE = new RoleConfig(
  "TOKEN_MANAGER_ROLE",
  "tokenManager"
);
export const COMPLIANCE_MANAGER_ROLE = new RoleConfig(
  "COMPLIANCE_MANAGER_ROLE",
  "complianceManager"
);
export const ADDON_MANAGER_ROLE = new RoleConfig(
  "ADDON_MANAGER_ROLE",
  "addonManager"
);
export const CLAIM_POLICY_MANAGER_ROLE = new RoleConfig(
  "CLAIM_POLICY_MANAGER_ROLE",
  "claimPolicyManager"
);
export const CLAIM_ISSUER_ROLE = new RoleConfig(
  "CLAIM_ISSUER_ROLE",
  "claimIssuer"
);
export const AUDITOR_ROLE = new RoleConfig("AUDITOR_ROLE", "auditor");
export const ORGANISATION_IDENTITY_MANAGER_ROLE = new RoleConfig(
  "ORGANISATION_IDENTITY_MANAGER_ROLE",
  "organisationIdentityManager"
);

// --- System Roles (ATKSystemRoles) ---
export const SYSTEM_MODULE_ROLE = new RoleConfig(
  "SYSTEM_MODULE_ROLE",
  "systemModule"
);
export const IDENTITY_REGISTRY_MODULE_ROLE = new RoleConfig(
  "IDENTITY_REGISTRY_MODULE_ROLE",
  "identityRegistryModule"
);
export const TOKEN_FACTORY_REGISTRY_MODULE_ROLE = new RoleConfig(
  "TOKEN_FACTORY_REGISTRY_MODULE_ROLE",
  "tokenFactoryRegistryModule"
);
export const TOKEN_FACTORY_MODULE_ROLE = new RoleConfig(
  "TOKEN_FACTORY_MODULE_ROLE",
  "tokenFactoryModule"
);
export const ADDON_FACTORY_REGISTRY_MODULE_ROLE = new RoleConfig(
  "ADDON_FACTORY_REGISTRY_MODULE_ROLE",
  "addonRegistryModule"
);
export const ADDON_FACTORY_MODULE_ROLE = new RoleConfig(
  "ADDON_FACTORY_MODULE_ROLE",
  "addonModule"
);
export const TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE = new RoleConfig(
  "TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE",
  "trustedIssuersMetaRegistryModule"
);

// --- Asset Roles (ATKAssetRoles) ---
export const GOVERNANCE_ROLE = new RoleConfig("GOVERNANCE_ROLE", "governance");
export const SUPPLY_MANAGEMENT_ROLE = new RoleConfig(
  "SUPPLY_MANAGEMENT_ROLE",
  "supplyManagement"
);
export const CUSTODIAN_ROLE = new RoleConfig("CUSTODIAN_ROLE", "custodian");
export const EMERGENCY_ROLE = new RoleConfig("EMERGENCY_ROLE", "emergency");

// --- SMART Token Extension Roles ---
export const BURNER_ROLE = new RoleConfig("BURNER_ROLE", "burner");
export const CAP_MANAGEMENT_ROLE = new RoleConfig(
  "CAP_MANAGEMENT_ROLE",
  "capManagement"
);
export const COMPLIANCE_ADMIN_ROLE = new RoleConfig(
  "COMPLIANCE_ADMIN_ROLE",
  "complianceAdmin"
);
export const FORCED_TRANSFER_ROLE = new RoleConfig(
  "FORCED_TRANSFER_ROLE",
  "forcedTransfer"
);
export const FREEZER_ROLE = new RoleConfig("FREEZER_ROLE", "freezer");
export const MINTER_ROLE = new RoleConfig("MINTER_ROLE", "minter");
export const PAUSER_ROLE = new RoleConfig("PAUSER_ROLE", "pauser");
export const RECOVERY_ROLE = new RoleConfig("RECOVERY_ROLE", "recovery");
export const TOKEN_ADMIN_ROLE = new RoleConfig(
  "TOKEN_ADMIN_ROLE",
  "tokenAdmin"
);
export const VERIFICATION_ADMIN_ROLE = new RoleConfig(
  "VERIFICATION_ADMIN_ROLE",
  "verificationAdmin"
);

// --- Addon-Specific Roles ---
export const FUNDS_MANAGER_ROLE = new RoleConfig(
  "FUNDS_MANAGER_ROLE",
  "fundsManager"
);
export const SALE_ADMIN_ROLE = new RoleConfig("SALE_ADMIN_ROLE", "saleAdmin");
export const SIGNER_ROLE = new RoleConfig("SIGNER_ROLE", "signer");
export const GLOBAL_LIST_MANAGER_ROLE = new RoleConfig(
  "GLOBAL_LIST_MANAGER_ROLE",
  "globalListManager"
);

// Export all roles as an array for iteration
export const ALL_ROLES = [
  DEFAULT_ADMIN_ROLE,
  SYSTEM_MANAGER_ROLE,
  IDENTITY_MANAGER_ROLE,
  TOKEN_MANAGER_ROLE,
  COMPLIANCE_MANAGER_ROLE,
  ADDON_MANAGER_ROLE,
  CLAIM_POLICY_MANAGER_ROLE,
  AUDITOR_ROLE,
  SYSTEM_MODULE_ROLE,
  IDENTITY_REGISTRY_MODULE_ROLE,
  TOKEN_FACTORY_REGISTRY_MODULE_ROLE,
  TOKEN_FACTORY_MODULE_ROLE,
  ADDON_FACTORY_REGISTRY_MODULE_ROLE,
  ADDON_FACTORY_MODULE_ROLE,
  GOVERNANCE_ROLE,
  SUPPLY_MANAGEMENT_ROLE,
  CUSTODIAN_ROLE,
  EMERGENCY_ROLE,
  BURNER_ROLE,
  CAP_MANAGEMENT_ROLE,
  COMPLIANCE_ADMIN_ROLE,
  FORCED_TRANSFER_ROLE,
  FREEZER_ROLE,
  MINTER_ROLE,
  PAUSER_ROLE,
  RECOVERY_ROLE,
  TOKEN_ADMIN_ROLE,
  VERIFICATION_ADMIN_ROLE,
  FUNDS_MANAGER_ROLE,
  SALE_ADMIN_ROLE,
  SIGNER_ROLE,
  GLOBAL_LIST_MANAGER_ROLE,
  CLAIM_ISSUER_ROLE,
  ORGANISATION_IDENTITY_MANAGER_ROLE,
];

// Helper function to get role by name
export function getRoleByName(name: string): RoleConfig | undefined {
  return ALL_ROLES.find((role) => role.name === name);
}

// Helper function to get role by field name
export function getRoleByFieldName(
  fieldName: AccessControlRoles
): RoleConfig | undefined {
  return ALL_ROLES.find((role) => role.fieldName === fieldName);
}

// Helper function to get role by bytes/hash
export function getRoleByBytes(bytes: `0x${string}`): RoleConfig | undefined {
  return ALL_ROLES.find((role) => role.bytes === bytes);
}
