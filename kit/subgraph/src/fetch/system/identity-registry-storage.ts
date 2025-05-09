import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityRegistryStorage } from "../../../generated/schema";
import { fetchAddress } from "../address";

export function fetchIdentityRegistryStorage(
  address: Address
): System_IdentityRegistryStorage {
  let identityRegistryStorage = System_IdentityRegistryStorage.load(address);

  if (!identityRegistryStorage) {
    identityRegistryStorage = new System_IdentityRegistryStorage(address);

    const addressEntity = fetchAddress(address);
    identityRegistryStorage.asAddress = addressEntity.id;

    identityRegistryStorage.save();
  }

  return identityRegistryStorage;
}
