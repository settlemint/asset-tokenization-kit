import { BigDecimal, BigInt, Bytes, Entity } from "@graphprotocol/graph-ts";
import { setValueWithDecimals } from "../../utils/decimals";
import { AssetType } from "../../utils/enums";
import { newAssetStatsData } from "../stats/assets";

export function calculateCollateral(
  asset: Entity,
  assetId: Bytes,
  collateralExact: BigInt,
  totalSupplyExact: BigInt,
  decimals: number
): void {
  const collateralRatio = collateralExact.equals(BigInt.zero())
    ? BigInt.fromString("100")
    : totalSupplyExact.div(collateralExact).times(BigInt.fromString("100"));

  asset.setBigDecimal(
    "collateralRatio",
    BigDecimal.fromString(collateralRatio.toString())
  );

  setValueWithDecimals(
    asset,
    "freeCollateral",
    collateralExact.minus(totalSupplyExact),
    decimals
  );

  const assetStats = newAssetStatsData(assetId, AssetType.deposit);
  assetStats.collateral = asset.getBigDecimal("collateral");
  assetStats.collateralExact = asset.getBigInt("collateralExact");
  assetStats.freeCollateral = asset.getBigDecimal("freeCollateral");
  assetStats.freeCollateralExact = asset.getBigInt("freeCollateralExact");
  assetStats.collateralRatio = asset.getBigDecimal("collateralRatio");
  assetStats.save();
}
