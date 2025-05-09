import { ByteArray, crypto } from "@graphprotocol/graph-ts";

export class Role {
  static DEFAULT_ADMIN_ROLE: string =
    "0x0000000000000000000000000000000000000000000000000000000000000000";
  static SUPPLY_MANAGEMENT_ROLE: string = crypto
    .keccak256(ByteArray.fromUTF8("SUPPLY_MANAGEMENT_ROLE"))
    .toHexString();
  static USER_MANAGEMENT_ROLE: string = crypto
    .keccak256(ByteArray.fromUTF8("USER_MANAGEMENT_ROLE"))
    .toHexString();
  static SIGNER_ROLE: string = crypto
    .keccak256(ByteArray.fromUTF8("SIGNER_ROLE"))
    .toHexString();
}

export const RoleMapping = {
  [Role.DEFAULT_ADMIN_ROLE]: "admins",
  [Role.SUPPLY_MANAGEMENT_ROLE]: "supplyManagers",
  [Role.USER_MANAGEMENT_ROLE]: "userManagers",
  [Role.SIGNER_ROLE]: "signers",
};
