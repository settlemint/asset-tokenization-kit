import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { getAddress } from 'viem';

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
  query StableCoins {
    stableCoins {
      ...StableCoinFields
    }
  }
`,
  [StableCoinFragment]
);

const OffchainAssets = hasuraGraphql(`
  query OffchainAssets {
    asset_aggregate {
      nodes {
        id
        private
      }
    }
  }
`);

export type StableCoinList = FragmentOf<typeof StableCoinFragment>;

export async function getStableCoins() {
  const [theGraphData, dbAssets] = await Promise.all([
    theGraphClientStarterkits.request(StableCoins),
    hasuraClient.request(OffchainAssets),
  ]);

  const theGraphStableCoins = theGraphData.stableCoins;
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
