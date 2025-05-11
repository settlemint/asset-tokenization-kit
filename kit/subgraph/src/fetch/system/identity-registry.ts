import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityRegistry } from "../../../generated/schema";
import { fetchAccessControl } from "../accesscontrol";
import { fetchAccount } from "../account";

export function fetchIdentityRegistry(
  address: Address
): System_IdentityRegistry {
  let identityRegistry = System_IdentityRegistry.load(address);

  if (!identityRegistry) {
    identityRegistry = new System_IdentityRegistry(address);

    const account = fetchAccount(address);
    identityRegistry.account = account.id;

    const accessControl = fetchAccessControl(address);
    identityRegistry.accessControl = accessControl.id;

    identityRegistry.save();
  }

  return identityRegistry;
}
