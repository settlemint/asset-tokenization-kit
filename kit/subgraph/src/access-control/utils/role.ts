import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";

class RoleConfig {
  _name: string;
  _bytes: Bytes;
  _hexString: string;
  _fieldName: string;

  constructor(name: string, fieldName: string) {
    this._name = name;
    if (name == "DEFAULT_ADMIN_ROLE") {
      this._hexString =
        "0x0000000000000000000000000000000000000000000000000000000000000000";
    } else {
      this._hexString = crypto
        .keccak256(ByteArray.fromUTF8(name))
        .toHexString();
    }
    this._bytes = Bytes.fromHexString(this._hexString);
    this._fieldName = fieldName;
  }

  get name(): string {
    return this._name;
  }

  get bytes(): Bytes {
    return this._bytes;
  }

  get hexString(): string {
    return this._hexString;
  }

  get fieldName(): string {
    return this._fieldName;
  }
}

export const Roles = [
  // --- Admin Roles ---
  new RoleConfig("ADDON_MANAGER_ROLE", "addonManager"),
  new RoleConfig("AUDITOR_ROLE", "auditor"),
  new RoleConfig("CLAIM_POLICY_MANAGER_ROLE", "claimPolicyManager"),
  new RoleConfig("COMPLIANCE_MANAGER_ROLE", "complianceManager"),
  new RoleConfig("DEFAULT_ADMIN_ROLE", "admin"),
  new RoleConfig("IDENTITY_MANAGER_ROLE", "identityManager"),
  new RoleConfig("SYSTEM_MANAGER_ROLE", "systemManager"),
  new RoleConfig("TOKEN_MANAGER_ROLE", "tokenManager"),

  // --- Module Roles ---
  new RoleConfig("ADDON_MODULE_ROLE", "addonModule"),
  new RoleConfig("ADDON_REGISTRY_MODULE_ROLE", "addonRegistryModule"),
  new RoleConfig("IDENTITY_REGISTRY_MODULE_ROLE", "identityRegistryModule"),
  new RoleConfig("SYSTEM_MODULE_ROLE", "systemModule"),
  new RoleConfig("TOKEN_FACTORY_MODULE_ROLE", "tokenFactoryModule"),
  new RoleConfig(
    "TOKEN_FACTORY_REGISTRY_MODULE_ROLE",
    "tokenFactoryRegistryModule"
  ),

  // --- Operational/Deprecated Roles ---
  new RoleConfig("BYPASS_LIST_MANAGER_ADMIN_ROLE", "bypassListManagerAdmin"),
  new RoleConfig("BYPASS_LIST_MANAGER_ROLE", "bypassListManager"),
  new RoleConfig("CLAIM_MANAGER_ROLE", "claimManager"),
  new RoleConfig("DEPLOYER_ROLE", "deployer"),
  new RoleConfig("IMPLEMENTATION_MANAGER_ROLE", "implementationManager"),
  new RoleConfig("REGISTRAR_ADMIN_ROLE", "registrarAdmin"),
  new RoleConfig("REGISTRAR_ROLE", "registrar"),
  new RoleConfig("REGISTRY_MANAGER_ROLE", "registryManager"),
  new RoleConfig("STORAGE_MODIFIER_ROLE", "storageModifier"),

  // --- Asset Token Roles (ATKRoles.sol) ---
  new RoleConfig("CUSTODIAN_ROLE", "custodian"),
  new RoleConfig("EMERGENCY_ROLE", "emergency"),
  new RoleConfig("GOVERNANCE_ROLE", "governance"),
  new RoleConfig("SUPPLY_MANAGEMENT_ROLE", "supplyManagement"),

  // --- Addon-Specific Roles ---
  new RoleConfig("FUNDS_MANAGER_ROLE", "fundsManager"),
  new RoleConfig("SALE_ADMIN_ROLE", "saleAdmin"),
  new RoleConfig("SIGNER_ROLE", "signer"),

  // --- Compliance Module Roles ---
  new RoleConfig("GLOBAL_LIST_MANAGER_ROLE", "globalListManager"),

  // --- SMART Token Roles (SMARTToken.sol) ---
  new RoleConfig("BURNER_ROLE", "burner"),
  new RoleConfig("CAP_MANAGEMENT_ROLE", "capManagement"),
  new RoleConfig("COMPLIANCE_ADMIN_ROLE", "complianceAdmin"),
  new RoleConfig("FORCED_TRANSFER_ROLE", "forcedTransfer"),
  new RoleConfig("FREEZER_ROLE", "freezer"),
  new RoleConfig("MINTER_ROLE", "minter"),
  new RoleConfig("PAUSER_ROLE", "pauser"),
  new RoleConfig("RECOVERY_ROLE", "recovery"),
  new RoleConfig("TOKEN_ADMIN_ROLE", "tokenAdmin"),
  new RoleConfig("VERIFICATION_ADMIN_ROLE", "verificationAdmin"),
];

export function getRoleConfigFromBytes(bytes: Bytes): RoleConfig {
  const hexString = bytes.toHexString();
  let role: RoleConfig | null = null;
  for (let i = 0; i < Roles.length; i++) {
    if (Roles[i].hexString == hexString) {
      role = Roles[i];
      break;
    }
  }

  if (!role) {
    throw new Error(`Unconfigured role: ${hexString}`);
  }

  return role;
}
