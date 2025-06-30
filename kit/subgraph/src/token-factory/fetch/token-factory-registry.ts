import { Address, Bytes } from "@graphprotocol/graph-ts";
import { TokenFactoryRegistry } from "../../../generated/schema";
import { TokenFactoryRegistry as TokenFactoryRegistryTemplate } from "../../../generated/templates";
import { fetchAccessControl } from "../../access-control/fetch/accesscontrol";
import { fetchAccount } from "../../account/fetch/account";

export function fetchTokenFactoryRegistry(
  address: Address
): TokenFactoryRegistry {
  let tokenFactoryRegistry = TokenFactoryRegistry.load(address);

  if (!tokenFactoryRegistry) {
    tokenFactoryRegistry = new TokenFactoryRegistry(address);
    tokenFactoryRegistry.system = Address.zero();
    tokenFactoryRegistry.accessControl = fetchAccessControl(address).id;
    tokenFactoryRegistry.account = fetchAccount(address).id;
    tokenFactoryRegistry.deployedInTransaction = Bytes.empty();
    tokenFactoryRegistry.save();
    TokenFactoryRegistryTemplate.create(address);
  }

  return tokenFactoryRegistry;
}
