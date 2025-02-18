import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/utils/pagination';
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
  query Equities($first: Int, $skip: Int) {
    equities(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
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
  query OffchainEquities($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
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
  const [theGraphEquities, dbAssets] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(Equities, { first, skip });
      return result.equities;
    }),
    fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(OffchainEquities, { limit, offset });
      return result.asset_aggregate.nodes;
    }),
  ]);

  const assetsById = new Map(dbAssets.map((asset) => [getAddress(asset.id), asset]));

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
