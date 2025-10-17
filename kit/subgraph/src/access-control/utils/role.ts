import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";

export class RoleConfig {
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
  // --- Core Admin Role ---
  new RoleConfig("DEFAULT_ADMIN_ROLE", "admin"),

  // --- People Roles (ATKPeopleRoles) ---
  new RoleConfig("SYSTEM_MANAGER_ROLE", "systemManager"),
  new RoleConfig("IDENTITY_MANAGER_ROLE", "identityManager"),
  new RoleConfig("TOKEN_MANAGER_ROLE", "tokenManager"),
  new RoleConfig("COMPLIANCE_MANAGER_ROLE", "complianceManager"),
  new RoleConfig("ADDON_MANAGER_ROLE", "addonManager"),
  new RoleConfig("CLAIM_POLICY_MANAGER_ROLE", "claimPolicyManager"),
  new RoleConfig("CLAIM_ISSUER_ROLE", "claimIssuer"),
  new RoleConfig("AUDITOR_ROLE", "auditor"),
  new RoleConfig(
    "ORGANISATION_IDENTITY_MANAGER_ROLE",
    "organisationIdentityManager"
  ),

  // --- System Roles (ATKSystemRoles) ---
  new RoleConfig("SYSTEM_MODULE_ROLE", "systemModule"),
  new RoleConfig("IDENTITY_REGISTRY_MODULE_ROLE", "identityRegistryModule"),
  new RoleConfig(
    "TOKEN_FACTORY_REGISTRY_MODULE_ROLE",
    "tokenFactoryRegistryModule"
  ),
  new RoleConfig("TOKEN_FACTORY_MODULE_ROLE", "tokenFactoryModule"),
  new RoleConfig("ADDON_FACTORY_REGISTRY_MODULE_ROLE", "addonRegistryModule"),
  new RoleConfig("ADDON_FACTORY_MODULE_ROLE", "addonModule"),
  new RoleConfig(
    "TRUSTED_ISSUERS_META_REGISTRY_MODULE_ROLE",
    "trustedIssuersMetaRegistryModule"
  ),

  // --- Asset Roles (ATKAssetRoles) ---
  new RoleConfig("GOVERNANCE_ROLE", "governance"),
  new RoleConfig("SUPPLY_MANAGEMENT_ROLE", "supplyManagement"),
  new RoleConfig("CUSTODIAN_ROLE", "custodian"),
  new RoleConfig("EMERGENCY_ROLE", "emergency"),

  // --- SMART Token Extension Roles ---
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

  // --- Addon-Specific Roles ---
  new RoleConfig("FUNDS_MANAGER_ROLE", "fundsManager"),
  new RoleConfig("SALE_ADMIN_ROLE", "saleAdmin"),
  new RoleConfig("SIGNER_ROLE", "signer"),
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

export function getRoleConfigFromFieldName(
  fieldName: string
): RoleConfig | null {
  for (let i = 0; i < Roles.length; i++) {
    if (Roles[i].fieldName == fieldName) {
      return Roles[i];
    }
  }
  return null;
}

export const DEFAULT_ADMIN_ROLE = Roles[0];
