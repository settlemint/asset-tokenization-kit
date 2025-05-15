import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Vault } from "../../../generated/schema";
import { fetchAccount } from "../../utils/account";

export function fetchVault(address: Address, timestamp: BigInt): Vault {
  let vault = Vault.load(address);

  if (!vault) {
    vault = new Vault(address);

    vault.creator = Address.zero();
    vault.signers = [];
    vault.admins = [];
    vault.pendingTransactionsCount = 0;
    vault.executedTransactionsCount = 0;
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
