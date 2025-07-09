import { keccak256, toBytes } from "viem";

// Compute the role constants from ATKSystemRoles.sol
export const computeATKSystemRoles = () => {
  return {
    DEFAULT_ADMIN_ROLE:
      "0x0000000000000000000000000000000000000000000000000000000000000000",

    // People Roles
    SYSTEM_MANAGER_ROLE: keccak256(toBytes("SYSTEM_MANAGER_ROLE")),
    IDENTITY_MANAGER_ROLE: keccak256(toBytes("IDENTITY_MANAGER_ROLE")),
    TOKEN_MANAGER_ROLE: keccak256(toBytes("TOKEN_MANAGER_ROLE")),
    COMPLIANCE_MANAGER_ROLE: keccak256(toBytes("COMPLIANCE_MANAGER_ROLE")),
    ADDON_MANAGER_ROLE: keccak256(toBytes("ADDON_MANAGER_ROLE")),
    CLAIM_POLICY_MANAGER_ROLE: keccak256(toBytes("CLAIM_POLICY_MANAGER_ROLE")),
    AUDITOR_ROLE: keccak256(toBytes("AUDITOR_ROLE")),

    // System Module Roles
    SYSTEM_MODULE_ROLE: keccak256(toBytes("SYSTEM_MODULE_ROLE")),
    IDENTITY_REGISTRY_MODULE_ROLE: keccak256(
      toBytes("IDENTITY_REGISTRY_MODULE_ROLE")
    ),
    TOKEN_FACTORY_REGISTRY_MODULE_ROLE: keccak256(
      toBytes("TOKEN_FACTORY_REGISTRY_MODULE_ROLE")
    ),
    TOKEN_FACTORY_MODULE_ROLE: keccak256(toBytes("TOKEN_FACTORY_MODULE_ROLE")),
    ADDON_REGISTRY_MODULE_ROLE: keccak256(
      toBytes("ADDON_REGISTRY_MODULE_ROLE")
    ),
    ADDON_MODULE_ROLE: keccak256(toBytes("ADDON_MODULE_ROLE")),

    // Legacy Roles
    REGISTRAR_ROLE: keccak256(toBytes("REGISTRAR_ROLE")),
    CLAIM_MANAGER_ROLE: keccak256(toBytes("CLAIM_MANAGER_ROLE")),
    DEPLOYER_ROLE: keccak256(toBytes("DEPLOYER_ROLE")),
    IMPLEMENTATION_MANAGER_ROLE: keccak256(
      toBytes("IMPLEMENTATION_MANAGER_ROLE")
    ),
    STORAGE_MODIFIER_ROLE: keccak256(toBytes("STORAGE_MODIFIER_ROLE")),
    REGISTRY_MANAGER_ROLE: keccak256(toBytes("REGISTRY_MANAGER_ROLE")),
    BYPASS_LIST_MANAGER_ROLE: keccak256(toBytes("BYPASS_LIST_MANAGER_ROLE")),
    BYPASS_LIST_MANAGER_ADMIN_ROLE: keccak256(
      toBytes("BYPASS_LIST_MANAGER_ADMIN_ROLE")
    ),
  };
};

// Print the role constants for debugging
if (require.main === module) {
  const roles = computeATKSystemRoles();
  console.log("ATK System Role Constants:");
  for (const [name, value] of Object.entries(roles)) {
    console.log(`${name}: ${value}`);
  }
}
