import { Address } from "@graphprotocol/graph-ts";
import { RegisteredIdentity } from "../../../generated/schema";
import { fetchAccount } from "../../account/fetch/account";
import { fetchIdentityRegistryStorage } from "../../identity-registry-storage/fetch/identity-registry-storage";

export function fetchRegisteredIdentity(
  registryStorage: Address,
  account: Address
): RegisteredIdentity {
  const id = registryStorage.concat(account);
  let registeredIdentity = RegisteredIdentity.load(id);

  if (!registeredIdentity) {
    registeredIdentity = new RegisteredIdentity(id);
    registeredIdentity.account = fetchAccount(account).id;
    registeredIdentity.registryStorage =
      fetchIdentityRegistryStorage(registryStorage).id;

    registeredIdentity.identity = Address.zero();
    registeredIdentity.country = 0;
    registeredIdentity.recoveredIdentity = null;
    registeredIdentity.isLost = false;

    registeredIdentity.save();
  }

  return registeredIdentity;
}
