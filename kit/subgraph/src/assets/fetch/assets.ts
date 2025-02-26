import { AssetActivityData } from "../../../generated/schema";

export function fetchAssetActivity(assetType: string): AssetActivityData {
  let assetActivity = AssetActivityData.load(assetType);
  if (!assetActivity) {
    assetActivity = new AssetActivityData(assetType);

    assetActivity.assetType = assetType;

    assetActivity.transferEventCount = 0;
    assetActivity.mintEventCount = 0;
    assetActivity.burnEventCount = 0;
    assetActivity.frozenEventCount = 0;
    assetActivity.unfrozenEventCount = 0;
    assetActivity.save();
  }

  return assetActivity;
}
