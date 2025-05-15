import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { AssetActivityData } from "../../../generated/schema";

export function fetchAssetActivity(assetType: string): AssetActivityData {
  let assetActivity = AssetActivityData.load(assetType);
  if (!assetActivity) {
    assetActivity = new AssetActivityData(assetType);

    assetActivity.assetType = assetType;

    assetActivity.transferEventCount = BigInt.zero();
    assetActivity.mintEventCount = BigInt.zero();
    assetActivity.burnEventCount = BigInt.zero();
    assetActivity.frozenEventCount = BigInt.zero();
    assetActivity.unfrozenEventCount = BigInt.zero();
    assetActivity.clawbackEventCount = BigInt.zero();

    assetActivity.totalSupply = BigDecimal.zero();
    assetActivity.totalSupplyExact = BigInt.zero();

    assetActivity.save();
  }

  return assetActivity;
}
