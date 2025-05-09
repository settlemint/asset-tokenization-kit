import { Address } from "@graphprotocol/graph-ts";
import { System_TrustedIssuersRegistry } from "../../../generated/schema";
import { fetchAddress } from "../address";

export function fetchTrustedIssuersRegistry(
  address: Address
): System_TrustedIssuersRegistry {
  let trustedIssuersRegistry = System_TrustedIssuersRegistry.load(address);

  if (!trustedIssuersRegistry) {
    trustedIssuersRegistry = new System_TrustedIssuersRegistry(address);

    const addressEntity = fetchAddress(address);
    trustedIssuersRegistry.asAddress = addressEntity.id;

    trustedIssuersRegistry.save();
  }

  return trustedIssuersRegistry;
}
