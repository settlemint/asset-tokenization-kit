import { Address, Bytes } from "@graphprotocol/graph-ts";
import { IdentityRegistry } from "../../../generated/schema";
import { IdentityRegistry as IdentityRegistryTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchIdentityRegistry(address: Address): IdentityRegistry {
  let identityRegistry = IdentityRegistry.load(address);

  if (!identityRegistry) {
    identityRegistry = new IdentityRegistry(address);

    identityRegistry.account = fetchAccount(address).id;
    identityRegistry.deployedInTransaction = Bytes.empty();
    identityRegistry.activeUserIdentitiesCount = 0;
    identityRegistry.activeContractIdentitiesCount = 0;
    identityRegistry.save();

    IdentityRegistryTemplate.create(address);
    setAccountContractName(address, "Identity Registry");
  }

  return identityRegistry;
}
