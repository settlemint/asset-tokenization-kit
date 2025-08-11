import { Address, Bytes } from "@graphprotocol/graph-ts";
import { VaultFactory } from "../../../../../generated/schema";
import { fetchAccount } from "../../../../account/fetch/account";
import { setAccountContractName } from "../../../../account/utils/account-contract-name";

export function fetchVaultFactory(address: Address): VaultFactory {
  let vaultFactory = VaultFactory.load(address);

  if (!vaultFactory) {
    vaultFactory = new VaultFactory(address);
    vaultFactory.account = fetchAccount(address).id;
    vaultFactory.deployedInTransaction = Bytes.empty();
    vaultFactory.save();
    setAccountContractName(address, "Vault Factory");
  }

  return vaultFactory;
}
