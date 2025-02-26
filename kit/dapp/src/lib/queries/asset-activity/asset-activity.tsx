import { fetchAllTheGraphPages } from '@/lib/pagination';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import {
  AssetActivityFragment,
  AssetActivityFragmentSchema,
} from './asset-activity-fragment';

/**
 * GraphQL query to fetch asset activity data
 */
const AssetActivity = theGraphGraphqlStarterkits(
  `
  query AssetActivity($first: Int, $skip: Int) {
    assetActivityDatas(first: $first, skip: $skip) {
      ...AssetActivityFragment
    }
  }
`,
  [AssetActivityFragment]
);

/**
 * Options interface for asset activity queries
 */
export interface AssetActivityOptions {
  /** Optional limit to restrict total items fetched */
  limit?: number;
}

/**
 * Fetches and processes asset activity data
 *
 * @param options - Query options including optional limit
 * @returns Array of validated asset activity data
 */
async function getAssetActivity({ limit }: AssetActivityOptions = {}) {
  try {
    const result = await fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(AssetActivity, {
        first,
        skip,
      });

      const activityData = result.assetActivityDatas || [];

      // Validate data using Zod schema
      const validatedData = activityData.map((data) =>
        AssetActivityFragmentSchema.parse(data)
      );

      // If we have a limit, check if we should stop
      if (limit && skip + validatedData.length >= limit) {
        return validatedData.slice(0, limit - skip);
      }

      return validatedData;
    }, limit);

    return result;
  } catch (error) {
    console.error('Error fetching asset activity:', error);
    return [];
  }
}

/**
 * Generates a consistent query key for asset activity queries
 *
 * @param options - Query options including optional limit
 * @returns Array representing the query key for React Query
 */
const getQueryKey = (options?: AssetActivityOptions) =>
  ['asset', 'activity', options?.limit] as const;

/**
 * React Query hook for fetching asset activity data
 *
 * @param options - Query options including optional limit
 * @returns Query result with asset activity data and query key
 */
export function useAssetActivity(options?: AssetActivityOptions) {
  const queryKey = getQueryKey(options);

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getAssetActivity(options),
  });

  return {
    ...result,
    queryKey,
  };
}
