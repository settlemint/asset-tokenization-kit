import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Vault } from "../../../generated/schema";
import { fetchAccount } from "../../fetch/account";

export function fetchVault(address: Address, timestamp: BigInt): Vault {
  let vault = Vault.load(address);

  if (!vault) {
    vault = new Vault(address);

    vault.signers = [];
    vault.admins = [];
    vault.requiredSigners = BigInt.zero();
    vault.totalSigners = BigInt.zero();
    vault.paused = false;
    vault.deployedOn = timestamp ? timestamp : BigInt.zero();
    vault.lastActivity = timestamp ? timestamp : BigInt.zero();
    vault.asAccount = fetchAccount(address).id;

    vault.save();
  }

  return vault;
}
