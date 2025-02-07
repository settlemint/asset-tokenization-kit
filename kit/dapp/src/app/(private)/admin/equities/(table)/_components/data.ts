import type { BaseAsset } from '@/components/blocks/asset-table/asset-table-columns';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { getAddress } from 'viem';

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

export type EquityAsset = FragmentOf<typeof EquityFragment> & BaseAsset;

export async function getEquities() {
  const [theGraphData, dbAssets] = await Promise.all([
    theGraphClientStarterkits.request(Equities),
    hasuraClient.request(OffchainAssets),
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
