import { Address } from "@graphprotocol/graph-ts";
import { System_IdentityFactory } from "../../generated/schema";
import { IdentityFactory as IdentityFactoryTemplate } from "../../generated/templates";
import { fetchAccessControl } from "../shared/accesscontrol/fetch-accesscontrol";
import { fetchAccount } from "../shared/account/fetch-account";

export function fetchIdentityFactory(address: Address): System_IdentityFactory {
  let identityFactory = System_IdentityFactory.load(address);

  if (!identityFactory) {
    identityFactory = new System_IdentityFactory(address);
    identityFactory.account = fetchAccount(address).id;
    identityFactory.accessControl = fetchAccessControl(address).id;
    identityFactory.save();
    IdentityFactoryTemplate.create(address);
  }

  return identityFactory;
}
