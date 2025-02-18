import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/utils/pagination';
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
  query Funds($first: Int, $skip: Int) {
    funds(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
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
  query OffchainFunds($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
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
  const [theGraphFunds, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(Funds, { first, skip });
      return result.funds;
    }),
    fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(OffchainFunds, { limit, offset });
      return result.asset_aggregate.nodes;
    }),
  ]);

  const assetsById = new Map(dbAssets.map((asset) => [getAddress(asset.id), asset]));

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
