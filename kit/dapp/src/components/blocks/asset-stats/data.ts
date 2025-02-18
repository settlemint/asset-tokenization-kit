import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';
import BigNumber from 'bignumber.js';
import { getUnixTime, startOfDay } from 'date-fns';

const AssetDetailStats = theGraphGraphqlStarterkits(`
query AssetDetailStats($asset: String!, $timestamp_gte: Timestamp!, $first: Int, $skip: Int) {
  assetStats_collection(
    interval: hour
    where: {asset: $asset, timestamp_gte: $timestamp_gte}
    first: $first
    skip: $skip
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
  const result = await fetchAllTheGraphPages(async (first, skip) => {
    const result = await theGraphClientStarterkits.request(AssetDetailStats, {
      asset,
      timestamp_gte: getUnixTime(startOfDay(new Date()).getTime() * 1000).toString(),
      first,
      skip,
    });
    return result.assetStats_collection;
  });

  return result.map((item) => ({
    ...item,
    totalBurned: new BigNumber(item.totalBurned).times(-1).toString(),
  }));
}
