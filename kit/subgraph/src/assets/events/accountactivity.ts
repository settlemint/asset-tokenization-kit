import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Account, AccountActivityEvent } from "../../../generated/schema";

export class AccountActivityEventName {
  static AssetCreated: string = "AssetCreated";
  static AssetTransferred: string = "AssetTransferred";
  static AssetMinted: string = "AssetMinted";
  static AssetBurned: string = "AssetBurned";
  static RoleGranted: string = "RoleGranted";
  static RoleRevoked: string = "RoleRevoked";
  static RoleAdminChanged: string = "RoleAdminChanged";
  static Approval: string = "Approval";
  static Paused: string = "Paused";
  static Unpaused: string = "Unpaused";
  static TokensFrozen: string = "TokensFrozen";
  static TokensUnfrozen: string = "TokensUnfrozen";
  static UserBlocked: string = "UserBlocked";
  static UserUnblocked: string = "UserUnblocked";
  // Bond specific events
  static BondMatured: string = "BondMatured";
  static BondRedeemed: string = "BondRedeemed";
  // Fixed yield specific events
  static YieldClaimed: string = "YieldClaimed";
  // Fund specific events
  static ManagementFeeCollected: string = "ManagementFeeCollected";
  static PerformanceFeeCollected: string = "PerformanceFeeCollected";
  static TokenWithdrawn: string = "TokenWithdrawn";
  // Bond and Fixed yield specific events
  static UnderlyingAssetTopUp: string = "UnderlyingAssetTopUp";
  static UnderlyingAssetWithdrawn: string = "UnderlyingAssetWithdrawn";
  // Stablecoin specific events
  static CollateralUpdated: string = "CollateralUpdated";
}

export function accountActivityEvent(
  id: Bytes,
  account: Account,
  eventName: string,
  timestamp: BigInt,
  assetType: string | null = null,
  asset: Bytes | null = null
): AccountActivityEvent {
  const event = new AccountActivityEvent(id);
  event.eventName = eventName;
  event.timestamp = timestamp;
  event.account = account.id;
  if (asset) {
    event.asset = asset;
  }
  if (assetType) {
    event.assetType = assetType;
  }
  event.save();

  account.lastActivity = timestamp;
  account.save();

  return event;
}
