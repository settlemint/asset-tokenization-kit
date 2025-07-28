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
  new RoleConfig("DEFAULT_ADMIN_ROLE", "admin"),
  new RoleConfig("AUDITOR_ROLE", "auditor"),
  new RoleConfig("ADDON_MODULE_ROLE", "addonModule"),
  new RoleConfig("ADDON_REGISTRY_MODULE_ROLE", "addonRegistryModule"),
  new RoleConfig("BYPASS_LIST_MANAGER_ROLE", "bypassListManager"),
  new RoleConfig("BYPASS_LIST_MANAGER_ADMIN_ROLE", "bypassListManagerAdmin"),
  new RoleConfig("CLAIM_MANAGER_ROLE", "claimManager"),
  new RoleConfig("CUSTODIAN_ROLE", "custodian"),
  new RoleConfig("DEPLOYER_ROLE", "deployer"),
  new RoleConfig("EMERGENCY_ROLE", "emergency"),
  new RoleConfig("FUNDS_MANAGER_ROLE", "fundsManager"),
  new RoleConfig("GLOBAL_LIST_MANAGER_ROLE", "globalListManager"),
  new RoleConfig("GOVERNANCE_ROLE", "governance"),
  new RoleConfig("IMPLEMENTATION_MANAGER_ROLE", "implementationManager"),
  new RoleConfig("IDENTITY_REGISTRY_MODULE_ROLE", "identityRegistryModule"),
  new RoleConfig("REGISTRAR_ROLE", "registrar"),
  new RoleConfig("REGISTRAR_ADMIN_ROLE", "registrarAdmin"),
  new RoleConfig("REGISTRY_MANAGER_ROLE", "registryManager"),
  new RoleConfig("SALE_ADMIN_ROLE", "saleAdmin"),
  new RoleConfig("SIGNER_ROLE", "signer"),
  new RoleConfig("STORAGE_MODIFIER_ROLE", "storageModifier"),
  new RoleConfig("SUPPLY_MANAGEMENT_ROLE", "supplyManagement"),
  new RoleConfig("SYSTEM_MODULE_ROLE", "systemModule"),
  new RoleConfig("TOKEN_FACTORY_MODULE_ROLE", "tokenFactoryModule"),
  new RoleConfig(
    "TOKEN_FACTORY_REGISTRY_MODULE_ROLE",
    "tokenFactoryRegistryModule"
  ),
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
