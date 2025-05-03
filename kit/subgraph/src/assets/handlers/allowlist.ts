import {
  Address,
  BigInt,
  Bytes,
  ethereum,
  store,
} from "@graphprotocol/graph-ts";
import { AllowedUser } from "../../../generated/schema";
import { fetchAccount } from "../../fetch/account";
import { createActivityLogEntry, EventType } from "../../fetch/activity-log";
import { fetchAssetBalance } from "../../fetch/balance";

export function allowUserHandler(
  event: ethereum.Event,
  assetId: Bytes,
  user: Address,
  decimals: number,
  initialBlockedState: boolean
): void {
  createActivityLogEntry(event, EventType.UserBlocked, [user]);
  const userAccount = fetchAccount(user);
  allowUser(assetId, userAccount.id, event.block.timestamp);
  handleBalance(
    assetId,
    user,
    decimals,
    initialBlockedState,
    event.block.timestamp,
    false
  );
}

export function disallowUserHandler(
  event: ethereum.Event,
  assetId: Bytes,
  user: Address,
  decimals: number,
  initialBlockedState: boolean
): void {
  createActivityLogEntry(event, EventType.UserUnblocked, [user]);
  const userAccount = fetchAccount(user);
  disallowUser(assetId, userAccount.id);
  handleBalance(
    assetId,
    user,
    decimals,
    initialBlockedState,
    event.block.timestamp,
    true
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
