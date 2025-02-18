import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/utils/pagination';
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
  query OffchainStableCoins($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      ...OffchainStableCoinsFields
    }
  }
`,
  [OffchainStableCoinFragment]
);

export type StableCoinAsset = Prettify<
  FragmentOf<typeof StableCoinFragment> & FragmentOf<typeof OffchainStableCoinFragment>['nodes'][number]
>;

export async function getStableCoins(): Promise<StableCoinAsset[]> {
  const [theGraphStableCoins, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(StableCoins, { first, skip });
      return result.stableCoins;
    }),
    fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(OffchainStableCoins, { limit, offset });
      return result.asset_aggregate.nodes;
    }),
  ]);

  const assetsById = new Map(dbAssets.map((asset) => [getAddress(asset.id), asset]));

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
