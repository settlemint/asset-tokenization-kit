import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { type Prettify, getAddress } from 'viem';

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

const OffchainFundFragment = hasuraGraphql(`
  fragment OffchainFundsFields on asset_aggregate {
      nodes {
        id
        private
      }
  }
`);

const OffchainFunds = hasuraGraphql(
  `
  query OffchainFunds {
    asset_aggregate {
      ...OffchainFundsFields
    }
  }
`,
  [OffchainFundFragment]
);

export type FundAsset = Prettify<
  FragmentOf<typeof FundFragment> & FragmentOf<typeof OffchainFundFragment>['nodes'][number]
>;

export async function getFunds(): Promise<FundAsset[]> {
  const [theGraphData, dbAssets] = await Promise.all([
    theGraphClientStarterkits.request(Funds),
    hasuraClient.request(OffchainFunds),
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
