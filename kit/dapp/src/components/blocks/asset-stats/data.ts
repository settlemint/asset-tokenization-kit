import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import BigNumber from 'bignumber.js';
import { getUnixTime, startOfDay } from 'date-fns';

const AssetDetailStats = theGraphGraphqlStarterkits(`
query AssetDetailStats($asset: String!, $timestamp_gte: Timestamp!) {
  assetStats_collection(
    interval: hour
    where: {asset: $asset, timestamp_gte: $timestamp_gte}
  ) {
    totalBurned
    totalCollateral
    totalFrozen
    totalLocked
    totalMinted
    totalSupply
    totalTransfers
    totalUnfrozen
    totalVolume
    timestamp
  }
}
`);

export async function getAssetDetailStats(asset: string) {
  const result = await theGraphClientStarterkits.request(AssetDetailStats, {
    asset,
    timestamp_gte: getUnixTime(startOfDay(new Date()).getTime() * 1000).toString(),
  });

  return result.assetStats_collection.map((item) => ({
    ...item,
    totalBurned: new BigNumber(item.totalBurned).times(-1).toString(),
  }));
}
