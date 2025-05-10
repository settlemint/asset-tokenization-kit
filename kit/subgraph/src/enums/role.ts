import { ByteArray, Bytes, crypto, log } from "@graphprotocol/graph-ts";

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const SUPPLY_MANAGEMENT_ROLE = crypto
  .keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE"))
  .toHexString();
const USER_MANAGEMENT_ROLE = crypto
  .keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE"))
  .toHexString();
const SIGNER_ROLE = crypto
  .keccak256(ByteArray.fromUTF8("SIGNER_ROLE"))
  .toHexString();
const DEPLOYMENT_OWNER_ROLE = crypto
  .keccak256(ByteArray.fromUTF8("DEPLOYMENT_OWNER_ROLE"))
  .toHexString();
const STORAGE_MODIFIER_ROLE = crypto
  .keccak256(ByteArray.fromUTF8("STORAGE_MODIFIER_ROLE"))
  .toHexString();

export class Role {
  static DEFAULT_ADMIN_ROLE: string = DEFAULT_ADMIN_ROLE;
  static SUPPLY_MANAGEMENT_ROLE: string = SUPPLY_MANAGEMENT_ROLE;
  static USER_MANAGEMENT_ROLE: string = USER_MANAGEMENT_ROLE;
  static SIGNER_ROLE: string = SIGNER_ROLE;
  static DEPLOYMENT_OWNER_ROLE: string = DEPLOYMENT_OWNER_ROLE;
  static STORAGE_MODIFIER_ROLE: string = STORAGE_MODIFIER_ROLE;
}

export function RoleArrayMapping(role: Bytes): string {
  const roleHex = role.toHexString();
  if (roleHex == Role.DEFAULT_ADMIN_ROLE) {
    return "admins";
  }
  if (roleHex == Role.SUPPLY_MANAGEMENT_ROLE) {
    return "supplyManagers";
  }
  if (roleHex == Role.USER_MANAGEMENT_ROLE) {
    return "userManagers";
  }
  if (roleHex == Role.SIGNER_ROLE) {
    return "signers";
  }
  if (roleHex == Role.DEPLOYMENT_OWNER_ROLE) {
    return "deploymentOwners";
  }
  if (roleHex == Role.STORAGE_MODIFIER_ROLE) {
    return "storageModifiers";
  }
  log.error(
    "Invalid role -> roleHex: {}, DEFAULT_ADMIN_ROLE: {}, SUPPLY_MANAGEMENT_ROLE: {}, USER_MANAGEMENT_ROLE: {}, SIGNER_ROLE: {}, DEPLOYMENT_OWNER_ROLE: {}, STORAGE_MODIFIER_ROLE: {}",
    [
      roleHex,
      Role.DEFAULT_ADMIN_ROLE,
      Role.SUPPLY_MANAGEMENT_ROLE,
      Role.USER_MANAGEMENT_ROLE,
      Role.SIGNER_ROLE,
      Role.DEPLOYMENT_OWNER_ROLE,
      Role.STORAGE_MODIFIER_ROLE,
    ]
  );
  throw new Error("Invalid role");
}
