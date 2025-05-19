import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityRegistryStorage } from "../../generated/schema";
import { IdentityRegistryStorage as IdentityRegistryStorageTemplate } from "../../generated/templates";
import { fetchAccessControl } from "../shared/accesscontrol/fetch-accesscontrol";
import { fetchAccount } from "../shared/account/fetch-account";

export function fetchIdentityRegistryStorage(
  address: Address
): System_IdentityRegistryStorage {
  let identityRegistryStorage = System_IdentityRegistryStorage.load(address);

  if (!identityRegistryStorage) {
    identityRegistryStorage = new System_IdentityRegistryStorage(address);
    identityRegistryStorage.account = fetchAccount(address).id;
    identityRegistryStorage.accessControl = fetchAccessControl(address).id;
    identityRegistryStorage.save();
    IdentityRegistryStorageTemplate.create(address);
  }

  return identityRegistryStorage;
}
