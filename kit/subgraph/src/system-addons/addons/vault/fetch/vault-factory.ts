import { Address, Bytes } from "@graphprotocol/graph-ts";
import { VaultFactory } from "../../../../../generated/schema";
import { fetchAccount } from "../../../../account/fetch/account";

export function fetchVaultFactory(address: Address): VaultFactory {
  let vaultFactory = VaultFactory.load(address);

  if (!vaultFactory) {
    vaultFactory = new VaultFactory(address);
    vaultFactory.account = fetchAccount(address).id;
    vaultFactory.deployedInTransaction = Bytes.empty();
    vaultFactory.save();
  }

  return vaultFactory;
}
