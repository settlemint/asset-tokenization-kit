import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityRegistryStorage } from "../../generated/schema";
import { IdentityRegistryStorage as IdentityRegistryStorageTemplate } from "../../generated/templates";
import { fetchAccessControl } from "../shared/accesscontrol/fetch-accesscontrol";
import { fetchAccount } from "../shared/account/fetch-account";

/**
 * Retrieves the `System_IdentityRegistryStorage` entity for the given address, creating and initializing it if it does not exist.
 *
 * If the entity does not exist, a new one is created with its `account` and `accessControl` fields set, saved to storage, and a corresponding `IdentityRegistryStorageTemplate` instance is created.
 *
 * @param address - The address used to identify the `System_IdentityRegistryStorage` entity.
 * @returns The loaded or newly created `System_IdentityRegistryStorage` entity.
 */
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
