import { BigInt, Bytes, store } from "@graphprotocol/graph-ts";
import { BlockedUser } from "../../generated/schema";
export function blockUser(
  asset: Bytes,
  account: Bytes,
  blockTimestamp: BigInt
): BlockedUser {
  const id = blockedUserId(asset, account);
  let blockedUser = BlockedUser.load(id);

  if (blockedUser == null) {
    blockedUser = new BlockedUser(id);
    blockedUser.asset = asset;
    blockedUser.user = account;
  }

  blockedUser.blockedAt = blockTimestamp;
  blockedUser.save();

  return blockedUser;
}

export function blockedUserId(asset: Bytes, account: Bytes): Bytes {
  return asset.concat(account);
}

export function unblockUser(asset: Bytes, account: Bytes): void {
  const id = blockedUserId(asset, account);
  store.remove("BlockedUser", id.toHexString());
}
