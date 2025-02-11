import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AccountActivityEvent } from "../../../generated/schema";

export enum AccountActivityEventName {
  AssetCreated = "AssetCreated",
  AssetTransferred = "AssetTransferred",
  AssetMinted = "AssetMinted",
  AssetBurned = "AssetBurned",
  RoleGranted = "RoleGranted",
  RoleRevoked = "RoleRevoked",
  RoleAdminChanged = "RoleAdminChanged",
  Approval = "Approval",
  Paused = "Paused",
  Unpaused = "Unpaused",
  TokensFrozen = "TokensFrozen",
  TokensUnfrozen = "TokensUnfrozen",
  UserBlocked = "UserBlocked",
  UserUnblocked = "UserUnblocked",
  // Bond specific events
  BondMatured = "BondMatured",
  BondRedeemed = "BondRedeemed",
  // Fixed yield specific events
  YieldClaimed = "YieldClaimed",
  // Fund specific events
  ManagementFeeCollected = "ManagementFeeCollected",
  PerformanceFeeCollected = "PerformanceFeeCollected",
  TokenWithdrawn = "TokenWithdrawn",
  // Bond and Fixed yield specific events
  UnderlyingAssetTopUp = "UnderlyingAssetTopUp",
  UnderlyingAssetWithdrawn = "UnderlyingAssetWithdrawn",
  // Stablecoin specific events
  CollateralUpdated = "CollateralUpdated",
}

export function accountActivityEvent(
  id: Bytes,
  account: Bytes,
  eventName: AccountActivityEventName,
  timestamp: BigInt,
  assetType: string | null = null,
  asset: Bytes | null = null
): AccountActivityEvent {
  const event = new AccountActivityEvent(id);
  event.eventName = eventName;
  event.timestamp = timestamp;
  event.account = account;
  if (asset) {
    event.asset = asset;
  }
  if (assetType) {
    event.assetType = assetType;
  }
  event.save();
  return event;
}
