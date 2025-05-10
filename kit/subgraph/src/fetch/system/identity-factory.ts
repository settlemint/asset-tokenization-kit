import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityFactory } from "../../../generated/schema";
import { fetchAccount } from "../account";

export function fetchIdentityFactory(address: Address): System_IdentityFactory {
  let identityFactory = System_IdentityFactory.load(address);

  if (!identityFactory) {
    identityFactory = new System_IdentityFactory(address);

    const account = fetchAccount(address);
    identityFactory.asAccount = account.id;

    identityFactory.save();
  }

  return identityFactory;
}
