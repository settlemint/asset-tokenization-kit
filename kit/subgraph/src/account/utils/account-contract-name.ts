import { Address } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../fetch/account";
import { updateIdentityEntityType } from "../../identity/utils/identity-classification";

export function setAccountContractName(address: Address, name: string): void {
  const account = fetchAccount(address);
  account.contractName = name;
  account.save();

  const identities = account.identities.load();
  for (let i = 0; i < identities.length; i++) {
    const identity = identities[i];
    if (updateIdentityEntityType(identity, name)) {
      identity.save();
    }
  }
}
