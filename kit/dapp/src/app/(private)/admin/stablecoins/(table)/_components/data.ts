import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllPages } from '@/lib/utils/pagination';
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
