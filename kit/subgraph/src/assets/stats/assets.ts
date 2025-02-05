import { BigDecimal, BigInt, Bytes } from '@graphprotocol/graph-ts';
import { AssetStatsData } from '../../../generated/schema';

export function newAssetStatsData(
  asset: Bytes,
  assetType: string,
  assetCategory: string = '',
  assetClass: string = ''
): AssetStatsData {
  const assetStats = new AssetStatsData('auto');
  assetStats.asset = asset;
  assetStats.assetType = assetType;
  assetStats.assetCategory = assetCategory;
  assetStats.assetClass = assetClass;
  assetStats.transfers = 1;
  assetStats.volume = BigDecimal.zero();
  assetStats.volumeExact = BigInt.zero();
  assetStats.burned = BigDecimal.zero();
  assetStats.burnedExact = BigInt.zero();
  assetStats.minted = BigDecimal.zero();
  assetStats.mintedExact = BigInt.zero();
  assetStats.locked = BigDecimal.zero();
  assetStats.lockedExact = BigInt.zero();
  assetStats.frozen = BigDecimal.zero();
  assetStats.frozenExact = BigInt.zero();
  assetStats.unfrozen = BigDecimal.zero();
  assetStats.unfrozenExact = BigInt.zero();
  assetStats.collateral = BigDecimal.zero();
  assetStats.collateralExact = BigInt.zero();
  assetStats.supply = BigDecimal.zero();
  assetStats.supplyExact = BigInt.zero();
  return assetStats;
}
