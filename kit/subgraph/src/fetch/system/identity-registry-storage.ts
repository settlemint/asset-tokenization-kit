import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityRegistryStorage } from "../../../generated/schema";
import { fetchAccount } from "../account";

export function fetchIdentityRegistryStorage(
  address: Address
): System_IdentityRegistryStorage {
  let identityRegistryStorage = System_IdentityRegistryStorage.load(address);

  if (!identityRegistryStorage) {
    identityRegistryStorage = new System_IdentityRegistryStorage(address);

    const account = fetchAccount(address);
    identityRegistryStorage.asAccount = account.id;

    identityRegistryStorage.save();
  }

  return identityRegistryStorage;
}
