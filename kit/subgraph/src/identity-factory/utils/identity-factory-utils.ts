import { Address } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../account/fetch/account";
import { fetchSystem } from "../../system/fetch/system";
import { fetchIdentityFactory } from "../fetch/identity-factory";

export function hasIdentityInSystem(
  accountAddress: Address,
  systemAddress: Address
): boolean {
  const account = fetchAccount(accountAddress);
  const system = fetchSystem(systemAddress);
  const identity = account.identities.load();

  for (let i = 0; i < identity.length; i++) {
    const identityFactoryAddress = identity[i].identityFactory;
    const identityFactory = fetchIdentityFactory(
      Address.fromBytes(identityFactoryAddress)
    );
    if (identityFactory.system.equals(system.id)) {
      return true;
    }
  }
  return false;
}
