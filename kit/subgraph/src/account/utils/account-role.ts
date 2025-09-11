import { Address } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../fetch/account";

export function incrementAccountRolesCount(address: Address): void {
  const account = fetchAccount(address);
  account.rolesCount = account.rolesCount + 1;
  account.save();
}

export function decrementAccountRolesCount(address: Address): void {
  const account = fetchAccount(address);
  if (account.rolesCount > 0) {
    account.rolesCount = account.rolesCount - 1;
  }
  account.save();
}
