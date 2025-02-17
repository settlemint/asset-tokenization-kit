import {AssetCount, AssetActivityData} from '../../../generated/schema';

export const fetchAssetCount = (assetType: string): AssetCount => {
  let assetCount = AssetCount.load(assetType);
  if (!assetCount) {
    assetCount = new AssetCount(assetType);
    assetCount.count = 0;
    assetCount.save();
  }
  return assetCount;
};
