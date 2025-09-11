import { Address } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../fetch/account";

export function setAccountContractName(address: Address, name: string): void {
  const account = fetchAccount(address);
  account.contractName = name;
  account.save();
}

export function increaseAccountRolesCount(address: Address): void {
  const account = fetchAccount(address);
  account.rolesCount = account.rolesCount + 1;
  account.save();
}

export function decreaseAccountRolesCount(address: Address): void {
  const account = fetchAccount(address);
  account.rolesCount = account.rolesCount - 1;
  account.save();
}
