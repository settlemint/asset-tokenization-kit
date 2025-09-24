import { Address, Bytes } from "@graphprotocol/graph-ts";
import { IdentityFactory } from "../../../generated/schema";
import { IdentityFactory as IdentityFactoryTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchIdentityFactory(address: Address): IdentityFactory {
  let identityFactory = IdentityFactory.load(address);

  if (!identityFactory) {
    identityFactory = new IdentityFactory(address);
    identityFactory.account = fetchAccount(address).id;
    identityFactory.deployedInTransaction = Bytes.empty();
    identityFactory.system = Address.zero();
    identityFactory.identitiesCreatedCount = 0;
    identityFactory.save();
    IdentityFactoryTemplate.create(address);
    setAccountContractName(address, "Identity Factory");
  }

  return identityFactory;
}
