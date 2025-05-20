import { ByteArray, Bytes, crypto } from "@graphprotocol/graph-ts";

class RoleConfig {
  _name: string;
  _bytes: Bytes;
  _hexString: string;
  _fieldName: string;

  constructor(name: string, fieldName: string) {
    this._name = name;
    if (name === "DEFAULT_ADMIN_ROLE") {
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
  new RoleConfig("SIGNER_ROLE", "signer"),
  new RoleConfig("DEPLOYMENT_OWNER_ROLE", "deploymentOwner"),
  new RoleConfig("STORAGE_MODIFIER_ROLE", "storageModifier"),
  new RoleConfig("COMPLIANCE_ADMIN_ROLE", "complianceAdmin"),
  new RoleConfig("VERIFICATION_ADMIN_ROLE", "verificationAdmin"),
  new RoleConfig("BURNER_ROLE", "burner"),
  new RoleConfig("MINTER_ROLE", "minter"),
  new RoleConfig("FREEZER_ROLE", "freezer"),
  new RoleConfig("FORCED_TRANSFER_ROLE", "forcedTransfer"),
  new RoleConfig("RECOVERY_ROLE", "recovery"),
  new RoleConfig("PAUSER_ROLE", "pauser"),
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
