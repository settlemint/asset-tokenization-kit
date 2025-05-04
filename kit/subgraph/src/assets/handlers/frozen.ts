import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { fetchAccount } from "../../utils/account";
import { createActivityLogEntry, EventType } from "../../utils/activity-log";
import { fetchAssetBalance } from "../../utils/balance";
import { increase } from "../../utils/counters";
import { setValueWithDecimals } from "../../utils/decimals";
import { fetchAssetActivity } from "../fetch/assets";
import { newAssetStatsData } from "../stats/assets";

export function frozenHandler(
  event: ethereum.Event,
  assetId: Bytes,
  assetType: string,
  user: Address,
  amount: BigInt,
  decimals: number,
  initialBlockedState: boolean
): void {
  createActivityLogEntry(event, EventType.TokensFrozen, [user]);
  handleBalance(
    assetId,
    user,
    decimals,
    initialBlockedState,
    amount,
    event.block.timestamp
  );
  handleAssetStats(assetId, assetType, amount, decimals);
  handleAssetActivity(assetType);
}

function handleBalance(
  assetId: Bytes,
  user: Address,
  decimals: number,
  initialBlockedState: boolean,
  amount: BigInt,
  timestamp: BigInt
): void {
  const userAccount = fetchAccount(user);
  const balance = fetchAssetBalance(
    assetId,
    userAccount.id,
    decimals,
    initialBlockedState
  );
  setValueWithDecimals(balance, "frozen", amount, decimals);
  balance.lastActivity = timestamp;
  balance.save();
}

function handleAssetStats(
  assetAddress: Bytes,
  assetType: string,
  amount: BigInt,
  decimals: number
): void {
  const assetStats = newAssetStatsData(assetAddress, assetType);
  setValueWithDecimals(assetStats, "frozen", amount, decimals);
  assetStats.save();
}

function handleAssetActivity(assetType: string): void {
  const assetActivity = fetchAssetActivity(assetType);
  increase(assetActivity, "frozenEventCount");
  assetActivity.save();
}
