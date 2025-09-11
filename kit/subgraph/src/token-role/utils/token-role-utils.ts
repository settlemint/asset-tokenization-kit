import { Address, Bytes, store } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../account/fetch/account";
import { fetchTokenRole } from "../fetch/token-role";

export function incrementTokenRoleCount(
  tokenAddress: Bytes,
  accountAddress: Bytes
): void {
  const tokenRole = fetchTokenRole(tokenAddress, accountAddress);
  const account = fetchAccount(Address.fromBytes(accountAddress));

  tokenRole.rolesCount = tokenRole.rolesCount + 1;
  account.rolesCount = account.rolesCount + 1;

  tokenRole.save();
  account.save();
}

export function decrementTokenRoleCount(
  tokenAddress: Bytes,
  accountAddress: Bytes
): void {
  const tokenRole = fetchTokenRole(tokenAddress, accountAddress);
  const account = fetchAccount(Address.fromBytes(accountAddress));

  tokenRole.rolesCount = tokenRole.rolesCount - 1;
  account.rolesCount = account.rolesCount - 1;

  if (tokenRole.rolesCount <= 0) {
    // Delete entity when no roles remaining to prevent storing empty role relationships
    // and reduce storage bloat from accounts that previously had roles but no longer do
    store.remove("TokenRole", tokenRole.id.toHexString());
  } else {
    tokenRole.save();
  }

  account.save();
}
