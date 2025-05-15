import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityRegistryStorage } from "../../../generated/schema";
import { IdentityRegistryStorage } from "../../../generated/templates/IdentityRegistryStorage/IdentityRegistryStorage";
import { fetchAccessControl } from "../accesscontrol";
import { fetchAccount } from "../account";
export function fetchIdentityRegistryStorage(
  address: Address
): System_IdentityRegistryStorage {
  let identityRegistryStorage = System_IdentityRegistryStorage.load(address);

  if (!identityRegistryStorage) {
    identityRegistryStorage = new System_IdentityRegistryStorage(address);

    const account = fetchAccount(address);
    identityRegistryStorage.account = account.id;

    const accessControl = fetchAccessControl(
      address,
      IdentityRegistryStorage.bind(address)
    );
    identityRegistryStorage.accessControl = accessControl.id;

    identityRegistryStorage.save();
  }

  return identityRegistryStorage;
}
