import { Bytes } from "@graphprotocol/graph-ts";
import { TokenRole } from "../../../generated/schema";

export function fetchTokenRole(tokenId: Bytes, accountId: Bytes): TokenRole {
  const tokenRoleId = tokenId.concat(accountId);
  let tokenRole = TokenRole.load(tokenRoleId);

  if (!tokenRole) {
    tokenRole = new TokenRole(tokenRoleId);
    tokenRole.token = tokenId;
    tokenRole.account = accountId;
    tokenRole.rolesCount = 0;
    tokenRole.save();
  }

  return tokenRole;
}