import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/pagination';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';
import { formatNumber } from '@/lib/utils/number';
import { safeParseWithLogging } from '@/lib/utils/zod';
import BigDecimal from 'js-big-decimal';
import { unstable_cache } from 'next/cache';
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
 * Cached function to fetch stablecoin list data from both sources
 */
const fetchStableCoinListData = unstable_cache(
  async () => {
    return Promise.all([
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
  },
  ['asset', 'stablecoin'],
  {
    revalidate: 60 * 60,
    tags: ['asset'],
  }
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
export async function getStableCoinList() {
  const [theGraphStableCoins, dbAssets] = await fetchStableCoinListData();

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

  return stableCoins.map((stableCoin) => ({
    ...stableCoin,
    // replace all the BigDecimals with formatted strings
    collateralCommittedRatio: Number(
      stableCoin.collateralCommittedRatio.getValue()
    ),
    totalSupply: formatNumber(stableCoin.totalSupply),
    collateral: formatNumber(stableCoin.collateral),
  }));
}
