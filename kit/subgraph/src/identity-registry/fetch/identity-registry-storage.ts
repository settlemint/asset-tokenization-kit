import { Address, Bytes } from "@graphprotocol/graph-ts";
import { IdentityRegistryStorage } from "../../../generated/schema";
import { fetchAccessControl } from "../../access-control/fetch/accesscontrol";
import { fetchAccount } from "../../account/fetch/account";

export function fetchIdentityRegistryStorage(
  address: Address
): IdentityRegistryStorage {
  let identityRegistryStorage = IdentityRegistryStorage.load(address);

  if (!identityRegistryStorage) {
    identityRegistryStorage = new IdentityRegistryStorage(address);
    identityRegistryStorage.accessControl = fetchAccessControl(address).id;
    identityRegistryStorage.account = fetchAccount(address).id;
    identityRegistryStorage.deployedInTransaction = Bytes.empty();
    identityRegistryStorage.save();
    // IdentityRegistryStorageTemplate.create(address);
  }

  return identityRegistryStorage;
}
