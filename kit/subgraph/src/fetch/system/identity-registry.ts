import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityRegistry } from "../../../generated/schema";
import { fetchAddress } from "../address";

export function fetchIdentityRegistry(
  address: Address
): System_IdentityRegistry {
  let identityRegistry = System_IdentityRegistry.load(address);

  if (!identityRegistry) {
    identityRegistry = new System_IdentityRegistry(address);

    const addressEntity = fetchAddress(address);
    identityRegistry.asAddress = addressEntity.id;

    identityRegistry.save();
  }

  return identityRegistry;
}
