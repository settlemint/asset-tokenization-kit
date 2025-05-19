import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityRegistry } from "../../generated/schema";
import { IdentityRegistry as IdentityRegistryTemplate } from "../../generated/templates";
import { fetchAccessControl } from "../shared/accesscontrol/fetch-accesscontrol";
import { fetchAccount } from "../shared/account/fetch-account";

/**
 * Loads an existing System_IdentityRegistry entity for the given address, or creates and initializes a new one if it does not exist.
 *
 * If the entity is newly created, its account and accessControl fields are set using the corresponding entities for the address, and a new IdentityRegistryTemplate instance is created.
 *
 * @param address - The address identifying the System_IdentityRegistry entity.
 * @returns The loaded or newly created System_IdentityRegistry entity.
 */
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
