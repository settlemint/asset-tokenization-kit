import { BigInt, Bytes, Entity, ethereum } from "@graphprotocol/graph-ts";
import { createActivityLogEntry, EventType } from "../../fetch/activity-log";
import { setValueWithDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";
import { newAssetStatsData } from "../stats/assets";

export function collateralUpdatedHandler(
  event: ethereum.Event,
  asset: Entity,
  amount: BigInt,
  decimals: number,
  timestamp: BigInt
): void {
  createActivityLogEntry(event, EventType.CollateralUpdated, []);
  setValueWithDecimals(asset, "collateral", amount, decimals);
  asset.setBigInt("lastCollateralUpdate", timestamp);
}

function handleAssetStats(
  asset: Entity,
  assetAddress: Bytes,
  assetType: string,
  value: BigInt,
  decimals: number
): void {
  const assetStats = newAssetStatsData(assetAddress, assetType);
  setValueWithDecimals(assetStats, "burned", value, decimals);
  let supply = assetStats.supplyExact.minus(value);
  setValueWithDecimals(assetStats, "supply", supply, decimals);

  if (assetType === AssetType.deposit || assetType === AssetType.stablecoin) {
    assetStats.collateral = asset.getBigDecimal("collateral");
    assetStats.collateralExact = asset.getBigInt("collateralExact");
    assetStats.freeCollateral = asset.getBigDecimal("freeCollateral");
    assetStats.freeCollateralExact = asset.getBigInt("freeCollateralExact");
    assetStats.collateralRatio = asset.getBigDecimal("collateralRatio");
  }

  assetStats.save();
}
