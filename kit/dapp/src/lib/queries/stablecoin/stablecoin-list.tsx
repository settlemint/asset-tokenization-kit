import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/pagination';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { safeParseWithLogging } from '@/lib/utils/zod';
import { cache } from 'react';
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
 * Fetches a list of stablecoins from both on-chain and off-chain sources
 *
 * @param options - Options for fetching stablecoin list
 *
 * @remarks
 * This function fetches data from both The Graph (on-chain) and Hasura (off-chain),
 * then merges the results to provide a complete view of each stablecoin.
 */
export const getStableCoinList = cache(async () => {
  const [theGraphStableCoins, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(StableCoinList, {
        first,
        skip,
      });

      const stableCoins = result.stableCoins || [];

      return stableCoins;
    }),

    fetchAllHasuraPages(async (pageLimit, offset) => {
      const result = await hasuraClient.request(OffchainStableCoinList, {
        limit: pageLimit,
        offset,
      });
      return result.asset_aggregate.nodes || [];
    }),
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

  return validatedStableCoins.map((stableCoin) => {
    const dbAsset = assetsById.get(getAddress(stableCoin.id));

    return {
      ...stableCoin,
      ...{
        private: false,
        ...dbAsset,
      },
    };
  });
});
