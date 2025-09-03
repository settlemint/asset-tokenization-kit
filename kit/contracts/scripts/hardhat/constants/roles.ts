import { type Hex, keccak256, toBytes } from "viem";

const defaultAdminRole: Hex =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

// People Roles (from ATKPeopleRoles.sol)
const systemManagerRole = keccak256(toBytes("SYSTEM_MANAGER_ROLE"));
const identityManagerRole = keccak256(toBytes("IDENTITY_MANAGER_ROLE"));
const tokenManagerRole = keccak256(toBytes("TOKEN_MANAGER_ROLE"));
const complianceManagerRole = keccak256(toBytes("COMPLIANCE_MANAGER_ROLE"));
const addonManagerRole = keccak256(toBytes("ADDON_MANAGER_ROLE"));
const claimPolicyManagerRole = keccak256(toBytes("CLAIM_POLICY_MANAGER_ROLE"));
const claimIssuerRole = keccak256(toBytes("CLAIM_ISSUER_ROLE"));
const auditorRole = keccak256(toBytes("AUDITOR_ROLE"));
const organisationIdentityManagerRole = keccak256(
  toBytes("ORGANISATION_IDENTITY_MANAGER_ROLE")
);

// System Roles (from ATKSystemRoles.sol)
const systemModuleRole = keccak256(toBytes("SYSTEM_MODULE_ROLE"));
const identityRegistryModuleRole = keccak256(
  toBytes("IDENTITY_REGISTRY_MODULE_ROLE")
);
const tokenFactoryRegistryModuleRole = keccak256(
  toBytes("TOKEN_FACTORY_REGISTRY_MODULE_ROLE")
);
const tokenFactoryModuleRole = keccak256(toBytes("TOKEN_FACTORY_MODULE_ROLE"));
const addonFactoryRegistryModuleRole = keccak256(
  toBytes("ADDON_FACTORY_REGISTRY_MODULE_ROLE")
);
const addonFactoryModuleRole = keccak256(toBytes("ADDON_FACTORY_MODULE_ROLE"));

// Asset Roles (from ATKAssetRoles.sol)
const governanceRole = keccak256(toBytes("GOVERNANCE_ROLE"));
const supplyManagementRole = keccak256(toBytes("SUPPLY_MANAGEMENT_ROLE"));
const custodianRole = keccak256(toBytes("CUSTODIAN_ROLE"));
const emergencyRole = keccak256(toBytes("EMERGENCY_ROLE"));

export const ATKRoles = {
  defaultAdminRole,
  people: {
    systemManagerRole,
    identityManagerRole,
    tokenManagerRole,
    complianceManagerRole,
    addonManagerRole,
    claimPolicyManagerRole,
    claimIssuerRole,
    auditorRole,
    organisationIdentityManagerRole,
  },
  system: {
    systemModuleRole,
    identityRegistryModuleRole,
    tokenFactoryRegistryModuleRole,
    tokenFactoryModuleRole,
    addonFactoryRegistryModuleRole,
    addonFactoryModuleRole,
  },
  assets: {
    governanceRole,
    supplyManagementRole,
    custodianRole,
    emergencyRole,
  },
} as const;
