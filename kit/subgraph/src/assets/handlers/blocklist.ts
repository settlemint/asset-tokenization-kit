import {
  Address,
  BigInt,
  Bytes,
  ethereum,
  store,
} from "@graphprotocol/graph-ts";
import { BlockedUser } from "../../../generated/schema";
import { fetchAccount } from "../../utils/account";
import { createActivityLogEntry, EventType } from "../../utils/activity-log";
import { fetchAssetBalance } from "../../utils/balance";

export function blockUserHandler(
  event: ethereum.Event,
  assetId: Bytes,
  user: Address,
  decimals: number,
  initialBlockedState: boolean,
  sender: Address
): void {
  createActivityLogEntry(event, EventType.UserBlocked, sender, [user]);
  const userAccount = fetchAccount(user);
  blockUser(assetId, userAccount.id, event.block.timestamp);
  handleBalance(
    assetId,
    user,
    decimals,
    initialBlockedState,
    event.block.timestamp,
    true
  );
}

export function unblockUserHandler(
  event: ethereum.Event,
  assetId: Bytes,
  user: Address,
  decimals: number,
  initialBlockedState: boolean,
  sender: Address
): void {
  createActivityLogEntry(event, EventType.UserUnblocked, sender, [user]);
  const userAccount = fetchAccount(user);
  unblockUser(assetId, userAccount.id);
  handleBalance(
    assetId,
    user,
    decimals,
    initialBlockedState,
    event.block.timestamp,
    false
  );
}

function handleBalance(
  assetId: Bytes,
  user: Address,
  decimals: number,
  initialBlockedState: boolean,
  timestamp: BigInt,
  blocked: boolean
): void {
  const userAccount = fetchAccount(user);
  const balance = fetchAssetBalance(
    assetId,
    userAccount.id,
    decimals,
    initialBlockedState
  );
  balance.blocked = blocked;
  balance.lastActivity = timestamp;
  balance.save();
}

function blockUser(
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

function blockedUserId(asset: Bytes, account: Bytes): Bytes {
  return asset.concat(account);
}

function unblockUser(asset: Bytes, account: Bytes): void {
  const id = blockedUserId(asset, account);
  store.remove("BlockedUser", id.toHexString());
}
