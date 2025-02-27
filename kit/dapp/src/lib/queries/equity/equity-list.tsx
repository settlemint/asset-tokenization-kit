import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/pagination';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import { getAddress } from 'viem';
import {
  EquityFragment,
  EquityFragmentSchema,
  OffchainEquityFragment,
  OffchainEquityFragmentSchema,
} from './equity-fragment';

/**
 * GraphQL query to fetch on-chain equity list from The Graph
 *
 * @remarks
 * Retrieves equitys ordered by total supply in descending order
 */
const EquityList = theGraphGraphqlStarterkits(
  `
  query EquityList($first: Int, $skip: Int) {
    equities(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...EquityFragment
    }
  }
`,
  [EquityFragment]
);

/**
 * GraphQL query to fetch off-chain equity list from Hasura
 */
const OffchainEquityList = hasuraGraphql(
  `
  query OffchainEquityList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainEquityFragment
      }
    }
  }
`,
  [OffchainEquityFragment]
);

/**
 * Options for fetching equity list
 *
 */
export interface EquityListOptions {
  limit?: number; // Optional limit to restrict total items fetched
}

/**
 * Fetches a list of equitys from both on-chain and off-chain sources
 *
 * @param options - Options for fetching equity list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each equity.
 */
export async function getEquityList({ limit }: EquityListOptions = {}) {
  try {
    const [theGraphEquities, dbAssets] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientStarterkits.request(EquityList, {
          first,
          skip,
        });

        const equities = result.equities || [];

        // If we have a limit, check if we should stop
        if (limit && skip + equities.length >= limit) {
          return equities.slice(0, limit - skip);
        }

        return equities;
      }, limit),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(OffchainEquityList, {
          limit: pageLimit,
          offset,
        });
        return result.asset_aggregate.nodes || [];
      }, limit),
    ]);

    // Parse and validate the data using Zod schemas
    const validatedEquities = theGraphEquities.map((equity) =>
      safeParseWithLogging(EquityFragmentSchema, equity, 'equity')
    );

    const validatedDbAssets = dbAssets.map((asset) =>
      safeParseWithLogging(
        OffchainEquityFragmentSchema,
        asset,
        'offchain equity'
      )
    );

    const assetsById = new Map(
      validatedDbAssets.map((asset) => [getAddress(asset.id), asset])
    );

    const equities = validatedEquities.map((equity) => {
      const dbAsset = assetsById.get(getAddress(equity.id));

      return {
        ...equity,
        ...{
          private: false,
          ...dbAsset,
        },
      };
    });

    return equities;
  } catch (error) {
    console.error('Error fetching equity list:', error);
    return [];
  }
}

/**
 * Generates a consistent query key for equity list queries
 *
 * @param [options] - Options for the equity list query
 */
export const getQueryKey = (options?: EquityListOptions) =>
  ['asset', 'equity', options?.limit ?? 'all'] as const;

/**
 * React Query hook for fetching equity list
 *
 * @param [options] - Options for fetching equity list
 *
 * @example
 * ```tsx
 * const { data: equities, isLoading } = useEquityList({ limit: 10 });
 * ```
 */
export function useEquityList(options?: EquityListOptions) {
  const queryKey = getQueryKey(options);

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getEquityList(options),
  });

  return {
    ...result,
    queryKey,
    // Inline equity config values
    assetType: 'equity' as const,
    urlSegment: 'equities',
    theGraphTypename: 'Equity' as const,
  };
}
