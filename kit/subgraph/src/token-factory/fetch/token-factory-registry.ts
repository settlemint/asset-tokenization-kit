import { Address, Bytes } from "@graphprotocol/graph-ts";
import { TokenFactoryRegistry } from "../../../generated/schema";
import { TokenFactoryRegistry as TokenFactoryRegistryTemplate } from "../../../generated/templates";
import { fetchAccount } from "../../account/fetch/account";
import { setAccountContractName } from "../../account/utils/account-contract-name";

export function fetchTokenFactoryRegistry(
  address: Address
): TokenFactoryRegistry {
  let tokenFactoryRegistry = TokenFactoryRegistry.load(address);

  if (!tokenFactoryRegistry) {
    tokenFactoryRegistry = new TokenFactoryRegistry(address);
    tokenFactoryRegistry.system = Address.zero();
    tokenFactoryRegistry.account = fetchAccount(address).id;
    tokenFactoryRegistry.deployedInTransaction = Bytes.empty();
    tokenFactoryRegistry.save();
    TokenFactoryRegistryTemplate.create(address);
    setAccountContractName(address, "Token Factory Registry");
  }

  return tokenFactoryRegistry;
}
