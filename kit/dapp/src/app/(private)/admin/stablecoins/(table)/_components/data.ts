import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { type Prettify, getAddress } from 'viem';

const StableCoinFragment = theGraphGraphqlStarterkits(`
  fragment StableCoinFields on StableCoin {
    id
    name
    symbol
    decimals
    totalSupply
    collateral
    paused
  }
`);

const StableCoins = theGraphGraphqlStarterkits(
  `
  query StableCoins($first: Int, $skip: Int) {
    stableCoins(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...StableCoinFields
    }
  }
`,
  [StableCoinFragment]
);

const OffchainStableCoinFragment = hasuraGraphql(`
  fragment OffchainStableCoinsFields on asset_aggregate {
      nodes {
        id
        private
      }
  }
`);

const OffchainStableCoins = hasuraGraphql(
  `
  query OffchainStableCoins {
    asset_aggregate {
      ...OffchainStableCoinsFields
    }
  }
`,
  [OffchainStableCoinFragment]
);

export type StableCoinAsset = Prettify<
  FragmentOf<typeof StableCoinFragment> & FragmentOf<typeof OffchainStableCoinFragment>['nodes'][number]
>;

async function fetchAllPages<T>(fetch: (first: number, skip: number) => Promise<T[]>, pageSize = 999): Promise<T[]> {
  if (pageSize > 999) {
    throw new Error('pageSize must be less than 1000');
  }
  const results: T[] = [];
  let hasMore = true;
  let skip = 0;
  const first = pageSize + 1; // +1 to check if there are more pages
  while (hasMore) {
    const data = await fetch(first, skip);
    results.push(...data.slice(0, pageSize)); // Remove last item as it's the check for more pages
    hasMore = data.length === first;
    skip += pageSize;
  }
  return results;
}

export async function getStableCoins(): Promise<StableCoinAsset[]> {
  const [theGraphStableCoins, dbAssets] = await Promise.all([
    fetchAllPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(StableCoins, { first, skip });
      return result.stableCoins;
    }, 999),
    hasuraClient.request(OffchainStableCoins),
  ]);

  const assetsById = new Map(dbAssets.asset_aggregate.nodes.map((asset) => [getAddress(asset.id), asset]));

  const stableCoins = theGraphStableCoins.map((stableCoin) => {
    const dbAsset = assetsById.get(getAddress(stableCoin.id));
    return {
      ...stableCoin,
      ...(dbAsset
        ? dbAsset
        : {
            private: false,
          }),
    };
  });

  return stableCoins;
}
