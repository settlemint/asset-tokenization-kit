import { Address } from "@graphprotocol/graph-ts";
import { TrustedIssuersRegistry } from "../../../generated/schema";
import { fetchAccessControl } from "../../access-control/fetch/accesscontrol";
import { fetchAccount } from "../../account/fetch/account";

export function fetchTrustedIssuersRegistry(
  address: Address
): TrustedIssuersRegistry {
  let trustedIssuersRegistry = TrustedIssuersRegistry.load(address);

  if (!trustedIssuersRegistry) {
    trustedIssuersRegistry = new TrustedIssuersRegistry(address);
    trustedIssuersRegistry.accessControl = fetchAccessControl(address).id;
    trustedIssuersRegistry.account = fetchAccount(address).id;
    trustedIssuersRegistry.save();
    // TrustedIssuersRegistryTemplate.create(address);
  }

  return trustedIssuersRegistry;
}
