import type { BaseAsset } from '@/components/blocks/asset-table/asset-table-columns';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { getAddress } from 'viem';

const FundFragment = theGraphGraphqlStarterkits(`
  fragment FundFields on Fund {
    id
    name
    symbol
    decimals
    totalSupply
    fundCategory
    fundClass
    paused
  }
`);

const Funds = theGraphGraphqlStarterkits(
  `
  query Funds {
    funds {
      ...FundFields
    }
  }
`,
  [FundFragment]
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

export type FundAsset = FragmentOf<typeof FundFragment> & BaseAsset;

export async function getFunds() {
  const [theGraphData, dbAssets] = await Promise.all([
    theGraphClientStarterkits.request(Funds),
    hasuraClient.request(OffchainAssets),
  ]);

  const theGraphFunds = theGraphData.funds;
  const assetsById = new Map(dbAssets.asset_aggregate.nodes.map((asset) => [getAddress(asset.id), asset]));

  const funds = theGraphFunds.map((fund) => {
    const dbAsset = assetsById.get(getAddress(fund.id));
    return {
      ...fund,
      ...(dbAsset
        ? dbAsset
        : {
            private: false,
          }),
    };
  });

  return funds;
}
