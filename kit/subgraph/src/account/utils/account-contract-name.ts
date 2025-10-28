import { Address } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../fetch/account";

export function setAccountContractName(address: Address, name: string): void {
  const account = fetchAccount(address);
  account.contractName = name;
  account.save();
}
