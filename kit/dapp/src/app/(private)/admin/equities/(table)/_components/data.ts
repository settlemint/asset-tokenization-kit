import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { type Prettify, getAddress } from 'viem';

const EquityFragment = theGraphGraphqlStarterkits(`
  fragment EquityFields on Equity {
    id
    name
    symbol
    decimals
    totalSupply
    equityCategory
    equityClass
    paused
  }
`);

const Equities = theGraphGraphqlStarterkits(
  `
  query Equities {
    equities {
      ...EquityFields
    }
  }
`,
  [EquityFragment]
);

const OffchainEquityFragment = hasuraGraphql(`
  fragment OffchainEquitiesFields on asset_aggregate {
      nodes {
        id
        private
      }
  }
`);

const OffchainEquities = hasuraGraphql(
  `
  query OffchainEquities {
    asset_aggregate {
      ...OffchainEquitiesFields
    }
  }
`,
  [OffchainEquityFragment]
);

export type EquityAsset = Prettify<
  FragmentOf<typeof EquityFragment> & FragmentOf<typeof OffchainEquityFragment>['nodes'][number]
>;

export async function getEquities(): Promise<EquityAsset[]> {
  const [theGraphData, dbAssets] = await Promise.all([
    theGraphClientStarterkits.request(Equities),
    hasuraClient.request(OffchainEquities),
  ]);

  const theGraphEquities = theGraphData.equities;
  const assetsById = new Map(dbAssets.asset_aggregate.nodes.map((asset) => [getAddress(asset.id), asset]));

  const equities = theGraphEquities.map((equity) => {
    const dbAsset = assetsById.get(getAddress(equity.id));
    return {
      ...equity,
      ...(dbAsset
        ? dbAsset
        : {
            private: false,
          }),
    };
  });

  return equities;
}
