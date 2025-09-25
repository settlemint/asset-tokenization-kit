import { Address } from "@graphprotocol/graph-ts";
import { RegisteredIdentity } from "../../../generated/schema";

export function hasRegisteredIdentity(
  account: Address,
  system: Address
): boolean {
  const registeredIdentity = RegisteredIdentity.load(account.concat(system));
  if (registeredIdentity === null) {
    return false;
  }
  return true;
}
