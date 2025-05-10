import { Address } from "@graphprotocol/graph-ts";
import { System_TrustedIssuersRegistry } from "../../../generated/schema";
import { fetchAccount } from "../account";

export function fetchTrustedIssuersRegistry(
  address: Address
): System_TrustedIssuersRegistry {
  let trustedIssuersRegistry = System_TrustedIssuersRegistry.load(address);

  if (!trustedIssuersRegistry) {
    trustedIssuersRegistry = new System_TrustedIssuersRegistry(address);

    const account = fetchAccount(address);
    trustedIssuersRegistry.asAccount = account.id;

    trustedIssuersRegistry.save();
  }

  return trustedIssuersRegistry;
}
