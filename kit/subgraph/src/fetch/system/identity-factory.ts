import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityFactory } from "../../../generated/schema";
import { fetchAddress } from "../address";

export function fetchIdentityFactory(address: Address): System_IdentityFactory {
  let identityFactory = System_IdentityFactory.load(address);

  if (!identityFactory) {
    identityFactory = new System_IdentityFactory(address);

    const addressEntity = fetchAddress(address);
    identityFactory.asAddress = addressEntity.id;

    identityFactory.save();
  }

  return identityFactory;
}
