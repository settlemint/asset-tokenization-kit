import { type Hex, keccak256, toBytes } from "viem";

const defaultAdminRole: Hex =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

// System Roles (from ATKSystemRoles.sol)
const registrarRole = keccak256(toBytes("REGISTRAR_ROLE"));
const claimManagerRole = keccak256(toBytes("CLAIM_MANAGER_ROLE"));
const tokenDeployerRole = keccak256(toBytes("TOKEN_DEPLOYER_ROLE"));
const storageModifierRole = keccak256(toBytes("STORAGE_MODIFIER_ROLE"));
const manageRegistriesRole = keccak256(toBytes("MANAGE_REGISTRIES_ROLE"));
const bypassListManagerRole = keccak256(toBytes("BYPASS_LIST_MANAGER_ROLE"));

// Asset Roles (from ATKRoles.sol)
const tokenGovernanceRole = keccak256(toBytes("TOKEN_GOVERNANCE_ROLE"));
const supplyManagementRole = keccak256(toBytes("SUPPLY_MANAGEMENT_ROLE"));
const custodianRole = keccak256(toBytes("CUSTODIAN_ROLE"));
const emergencyRole = keccak256(toBytes("EMERGENCY_ROLE"));

export const ATKRoles = {
  defaultAdminRole,
  // System Roles
  registrarRole,
  claimManagerRole,
  tokenDeployerRole,
  storageModifierRole,
  manageRegistriesRole,
  bypassListManagerRole,
  // Asset Roles
  tokenGovernanceRole,
  supplyManagementRole,
  custodianRole,
  emergencyRole,
} as const; // Using 'as const' for stricter typing if preferred
