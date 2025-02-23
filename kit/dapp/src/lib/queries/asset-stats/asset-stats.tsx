import { fetchAllTheGraphPages } from '@/lib/pagination';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getUnixTime, startOfDay, subDays } from 'date-fns';
import { type Address, getAddress } from 'viem';
import {
  AssetStatsFragment,
  AssetStatsFragmentSchema,
} from './asset-stats-fragment';

/**
 * GraphQL query to fetch asset statistics from The Graph
 *
 * @remarks
 * Retrieves hourly statistics for an asset within a specified time range
 */
const AssetStats = theGraphGraphqlStarterkits(
  `
query AssetStats($asset: String!, $timestamp_gte: Timestamp!, $first: Int, $skip: Int) {
  assetStats_collection(
    interval: hour
    where: {asset: $asset, timestamp_gte: $timestamp_gte}
    first: $first
    skip: $skip
  ) {
    ...AssetStatsFragment
  }
}
`,
  [AssetStatsFragment]
);

/**
 * Props interface for asset stats components
 *
 * @property {Address} address - The blockchain address of the asset contract
 * @property {number} [days] - Number of days to look back for statistics (default: 1)
 */
export interface AssetStatsProps {
  /** Ethereum address of the asset contract */
  address: Address;
  /** Number of days to look back (default: 1) */
  days?: number;
}

/**
 * Fetches and processes asset statistics data from The Graph
 *
 * @param {AssetStatsProps} params - Object containing the asset address and time range
 * @returns {Promise<Array<ProcessedAssetStats>>} Array of processed asset statistics
 *
 * @remarks
 * This function calculates the start date based on the days parameter,
 * fetches data from The Graph, validates it using the AssetStatsFragmentSchema,
 * and processes the totalBurned field to be a negated string value.
 * Returns an empty array if an error occurs during the query.
 */
async function getAssetStats({ address, days = 1 }: AssetStatsProps) {
  try {
    // Calculate timestamp for start date
    const startDate = subDays(new Date(), days - 1);
    const timestampGte = getUnixTime(startOfDay(startDate)).toString();

    const result = await fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(AssetStats, {
        asset: address,
        timestamp_gte: timestampGte,
        first,
        skip,
      });

      // Validate data using Zod schema
      const validatedStats = (result.assetStats_collection || []).map((item) =>
        AssetStatsFragmentSchema.parse(item)
      );

      return validatedStats;
    });

    // Process the data
    return result.map((item) => ({
      ...item,
      totalBurned: item.totalBurned.toString(),
    }));
  } catch (error) {
    console.error(`Error fetching asset stats for ${address}:`, error);
    return [];
  }
}

/**
 * Creates a memoized query key for asset stats queries
 *
 * @param {AssetStatsProps} params - Object containing the asset address and time range
 * @returns {readonly [string, string, string, number|undefined]} The query key tuple
 */
const getQueryKey = ({ address, days }: AssetStatsProps) =>
  ['asset', 'stats', getAddress(address), days] as const;

/**
 * React Query hook for fetching asset statistics
 *
 * @param {AssetStatsProps} params - Object containing the asset address and time range
 * @returns {Object} Query result with asset statistics and query key
 *
 * @example
 * ```tsx
 * const { data: assetStats, isLoading } = useAssetStats({
 *   address: "0x123...",
 *   days: 7
 * });
 *
 * // Later in your component
 * {assetStats.map(stat => (
 *   <StatItem
 *     key={stat.timestamp.toString()}
 *     supply={stat.totalSupply}
 *     volume={stat.totalVolume}
 *   />
 * ))}
 * ```
 */
export function useAssetStats({ address, days = 1 }: AssetStatsProps) {
  const queryKey = getQueryKey({ address, days });

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getAssetStats({ address, days }),
  });

  return {
    ...result,
    queryKey,
  };
}
