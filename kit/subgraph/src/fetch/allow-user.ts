import { BigInt, Bytes, store } from "@graphprotocol/graph-ts";
import { AllowedUser } from "../../generated/schema";
export function allowUser(
  asset: Bytes,
  account: Bytes,
  blockTimestamp: BigInt
): AllowedUser {
  const id = allowedUserId(asset, account);
  let allowedUser = AllowedUser.load(id);

  if (allowedUser == null) {
    allowedUser = new AllowedUser(id);
    allowedUser.asset = asset;
    allowedUser.user = account;
  }

  allowedUser.allowedAt = blockTimestamp;
  allowedUser.save();

  return allowedUser;
}

export function allowedUserId(asset: Bytes, account: Bytes): Bytes {
  return asset.concat(account);
}

export function disallowUser(asset: Bytes, account: Bytes): void {
  const id = allowedUserId(asset, account);
  store.remove("AllowedUser", id.toHexString());
}
