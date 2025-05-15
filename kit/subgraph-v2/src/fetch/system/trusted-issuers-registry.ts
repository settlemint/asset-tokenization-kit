import { Address } from "@graphprotocol/graph-ts";
import { System_TrustedIssuersRegistry } from "../../../generated/schema";
import { TrustedIssuersRegistry } from "../../../generated/templates/TrustedIssuersRegistry/TrustedIssuersRegistry";
import { fetchAccessControl } from "../accesscontrol";
import { fetchAccount } from "../account";

export function fetchTrustedIssuersRegistry(
  address: Address
): System_TrustedIssuersRegistry {
  let trustedIssuersRegistry = System_TrustedIssuersRegistry.load(address);

  if (!trustedIssuersRegistry) {
    trustedIssuersRegistry = new System_TrustedIssuersRegistry(address);

    const account = fetchAccount(address);
    trustedIssuersRegistry.account = account.id;

    const accessControl = fetchAccessControl(
      address,
      TrustedIssuersRegistry.bind(address)
    );
    trustedIssuersRegistry.accessControl = accessControl.id;

    trustedIssuersRegistry.save();
  }

  return trustedIssuersRegistry;
}
