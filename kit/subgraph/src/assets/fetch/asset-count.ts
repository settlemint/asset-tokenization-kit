import {  AssetCount } from '../../../generated/schema';

export const fetchAssetCount = (assetType: string): AssetCount => {
  let assetCount = AssetCount.load(assetType);
  if (!assetCount) {
    assetCount = new AssetCount(assetType);
    assetCount.count = 0;
    assetCount.assetType = assetType;
    assetCount.save();
  }
  return assetCount;
};
