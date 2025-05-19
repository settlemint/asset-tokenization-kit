import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityRegistry } from "../../generated/schema";
import { IdentityRegistry as IdentityRegistryTemplate } from "../../generated/templates";
import { fetchAccessControl } from "../shared/accesscontrol/fetch-accesscontrol";
import { fetchAccount } from "../shared/account/fetch-account";

export function fetchIdentityRegistry(
  address: Address
): System_IdentityRegistry {
  let identityRegistry = System_IdentityRegistry.load(address);

  if (!identityRegistry) {
    identityRegistry = new System_IdentityRegistry(address);
    identityRegistry.account = fetchAccount(address).id;
    identityRegistry.accessControl = fetchAccessControl(address).id;
    identityRegistry.save();
    IdentityRegistryTemplate.create(address);
  }

  return identityRegistry;
}
