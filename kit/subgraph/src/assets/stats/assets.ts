import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { AssetStatsData, StableCoin } from "../../../generated/schema";

export function newAssetStatsData(
  asset: Bytes,
  assetType: string,
  assetCategory: string = "",
  assetClass: string = ""
): AssetStatsData {
  const assetStats = new AssetStatsData("auto");

  // Filters
  assetStats.asset = asset;
  assetStats.assetType = assetType;
  assetStats.assetCategory = assetCategory;
  assetStats.assetClass = assetClass;

  // Transfers
  assetStats.transfers = 0;
  assetStats.volume = BigDecimal.zero();
  assetStats.volumeExact = BigInt.zero();

  // Supply
  assetStats.supply = BigDecimal.zero();
  assetStats.supplyExact = BigInt.zero();
  assetStats.minted = BigDecimal.zero();
  assetStats.mintedExact = BigInt.zero();
  assetStats.burned = BigDecimal.zero();
  assetStats.burnedExact = BigInt.zero();

  // Frozen
  assetStats.locked = BigDecimal.zero();
  assetStats.lockedExact = BigInt.zero();
  assetStats.frozen = BigDecimal.zero();
  assetStats.frozenExact = BigInt.zero();
  assetStats.unfrozen = BigDecimal.zero();
  assetStats.unfrozenExact = BigInt.zero();

  // Collateral
  assetStats.collateral = BigDecimal.zero();
  assetStats.collateralExact = BigInt.zero();
  assetStats.collateralRatio = BigDecimal.zero();
  assetStats.freeCollateral = BigDecimal.zero();
  assetStats.freeCollateralExact = BigInt.zero();

  return assetStats;
}

export function updateCollateralData(
  assetStats: AssetStatsData,
  stableCoin: StableCoin
): AssetStatsData {
  // Collateral
  assetStats.collateral = stableCoin.collateral;
  assetStats.collateralExact = stableCoin.collateralExact;
  assetStats.freeCollateral = stableCoin.freeCollateral;
  assetStats.freeCollateralExact = stableCoin.freeCollateralExact;
  assetStats.collateralRatio = stableCoin.collateralRatio;

  return assetStats;
}
