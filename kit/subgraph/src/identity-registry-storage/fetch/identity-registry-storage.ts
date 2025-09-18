import { Address, Bytes } from "@graphprotocol/graph-ts";
import { IdentityRegistryStorage } from "../../../generated/schema";
import { IdentityRegistryStorage as IdentityRegistryStorageTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchIdentityRegistryStorage(
  address: Address
): IdentityRegistryStorage {
  let identityRegistryStorage = IdentityRegistryStorage.load(address);

  if (!identityRegistryStorage) {
    identityRegistryStorage = new IdentityRegistryStorage(address);
    identityRegistryStorage.account = fetchAccount(address).id;
    identityRegistryStorage.deployedInTransaction = Bytes.empty();
    identityRegistryStorage.system = Address.zero();
    identityRegistryStorage.save();
    IdentityRegistryStorageTemplate.create(address);
    setAccountContractName(address, "Identity Registry Storage");
  }

  return identityRegistryStorage;
}
