import { ByteArray, crypto } from "@graphprotocol/graph-ts";

// These need to match the keys of the assetConfig object in the dapp
export class AssetType {
  static bond: string = "bond";
  static equity: string = "equity";
  static stablecoin: string = "stablecoin";
  static cryptocurrency: string = "cryptocurrency";
  static fund: string = "fund";
  static deposit: string = "deposit";
  static xvp: string = "xvp";
}

export class FactoryType {
  static bond: string = "bond";
  static equity: string = "equity";
  static stablecoin: string = "stablecoin";
  static cryptocurrency: string = "cryptocurrency";
  static fund: string = "fund";
  static fixedyield: string = "fixedyield";
  static deposit: string = "deposit";
  static xvp: string = "xvp";
  static vault: string = "vault";
}

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

export class VaultTransactionType {
  static NativeCurrencyTransfer: string = "NativeCurrencyTransfer";
  static ERC20Transfer: string = "ERC20Transfer";
  static ContractCall: string = "ContractCall";
}
