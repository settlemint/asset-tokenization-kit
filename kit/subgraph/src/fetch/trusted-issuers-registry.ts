import { Address } from "@graphprotocol/graph-ts";
import { System_TrustedIssuersRegistry } from "../../generated/schema";
import { TrustedIssuersRegistry as TrustedIssuersRegistryTemplate } from "../../generated/templates";
import { fetchAccessControl } from "../shared/accesscontrol/fetch-accesscontrol";
import { fetchAccount } from "../shared/account/fetch-account";

/**
 * Loads an existing System_TrustedIssuersRegistry entity for the given address, or creates and initializes one if it does not exist.
 *
 * @param address - The blockchain address identifying the trusted issuers registry.
 * @returns The loaded or newly created System_TrustedIssuersRegistry entity.
 */
export function fetchTrustedIssuersRegistry(
  address: Address
): System_TrustedIssuersRegistry {
  let trustedIssuersRegistry = System_TrustedIssuersRegistry.load(address);

  if (!trustedIssuersRegistry) {
    trustedIssuersRegistry = new System_TrustedIssuersRegistry(address);
    trustedIssuersRegistry.account = fetchAccount(address).id;
    trustedIssuersRegistry.accessControl = fetchAccessControl(address).id;
    trustedIssuersRegistry.save();
    TrustedIssuersRegistryTemplate.create(address);
  }

  return trustedIssuersRegistry;
}
