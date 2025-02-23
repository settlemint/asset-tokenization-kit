import { assetConfig } from '@/lib/config/assets';
import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/pagination';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { useSuspenseQuery } from '@tanstack/react-query';
import BigDecimal from 'js-big-decimal';
import { getAddress } from 'viem';
import {
  OffchainStableCoinFragment,
  OffchainStableCoinFragmentSchema,
  StableCoinFragment,
  StableCoinFragmentSchema,
} from './stablecoin-fragment';

/**
 * GraphQL query to fetch on-chain stablecoin list from The Graph
 *
 * @remarks
 * Retrieves stablecoins ordered by total supply in descending order
 */
const StableCoinList = theGraphGraphqlStarterkits(
  `
  query StableCoinList($first: Int, $skip: Int) {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...StableCoinFragment
    }
  }
`,
  [StableCoinFragment]
);

/**
 * GraphQL query to fetch off-chain stablecoin list from Hasura
 */
const OffchainStableCoinList = hasuraGraphql(
  `
  query OffchainStableCoinList($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      nodes {
        ...OffchainStableCoinFragment
      }
    }
  }
`,
  [OffchainStableCoinFragment]
);

/**
 * Options for fetching stablecoin list
 *
 * @property {number} [limit] - Optional limit to restrict total items fetched
 */
export interface StableCoinListOptions {
  limit?: number; // Optional limit to restrict total items fetched
}

/**
 * Fetches a list of stablecoins from both on-chain and off-chain sources
 *
 * @param {StableCoinListOptions} options - Options for fetching stablecoin list
 * @returns {Promise<Array<StableCoin>>} Array of stablecoins with combined on-chain and off-chain data
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each stablecoin.
 */
export async function getStableCoinList({ limit }: StableCoinListOptions = {}) {
  try {
    const [theGraphStableCoins, dbAssets] = await Promise.all([
      fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientStarterkits.request(StableCoinList, {
          first,
          skip,
        });

        const stableCoins = result.stableCoins || [];

        // If we have a limit, check if we should stop
        if (limit && skip + stableCoins.length >= limit) {
          return stableCoins.slice(0, limit - skip);
        }

        return stableCoins;
      }, limit),

      fetchAllHasuraPages(async (pageLimit, offset) => {
        const result = await hasuraClient.request(OffchainStableCoinList, {
          limit: pageLimit,
          offset,
        });
        return result.asset_aggregate.nodes || [];
      }, limit),
    ]);

    // Parse and validate the data using Zod schemas
    const validatedStableCoins = theGraphStableCoins.map((stableCoin) =>
      safeParseWithLogging(StableCoinFragmentSchema, stableCoin, 'stablecoin')
    );

    const validatedDbAssets = dbAssets.map((asset) =>
      safeParseWithLogging(
        OffchainStableCoinFragmentSchema,
        asset,
        'offchain stablecoin'
      )
    );

    const assetsById = new Map(
      validatedDbAssets.map((asset) => [getAddress(asset.id), asset])
    );

    const stableCoins = validatedStableCoins.map((stableCoin) => {
      const dbAsset = assetsById.get(getAddress(stableCoin.id));

      // Calculate collateral ratio similar to stablecoin-detail.tsx
      const collateralCommittedRatio =
        stableCoin.collateral.compareTo(new BigDecimal(0)) === 0
          ? new BigDecimal(100)
          : stableCoin.totalSupply
              .divide(stableCoin.collateral)
              .multiply(new BigDecimal(100));

      return {
        ...stableCoin,
        ...{
          private: false,
          ...dbAsset,
        },
        collateralCommittedRatio,
      };
    });

    return stableCoins;
  } catch (error) {
    console.error('Error fetching stablecoin list:', error);
    return [];
  }
}

/**
 * Creates a memoized query key for stablecoin list queries
 *
 * @param {StableCoinListOptions} [options] - Options for the stablecoin list query
 * @returns {readonly [string, string, number | undefined]} The query key tuple
 */
const getQueryKey = (options?: StableCoinListOptions) =>
  ['asset', assetConfig.stablecoin.queryKey, options?.limit] as const;

/**
 * React Query hook for fetching stablecoin list
 *
 * @param {StableCoinListOptions} [options] - Options for fetching stablecoin list
 * @returns {Object} Query result with stablecoin data, config, and query key
 *
 * @example
 * ```tsx
 * const { data: stableCoins, isLoading } = useStableCoinList({ limit: 10 });
 * ```
 */
export function useStableCoinList(options?: StableCoinListOptions) {
  const queryKey = getQueryKey(options);

  const result = useSuspenseQuery({
    queryKey,
    queryFn: () => getStableCoinList(options),
  });

  return {
    ...result,
    config: assetConfig.stablecoin,
    queryKey,
  };
}
