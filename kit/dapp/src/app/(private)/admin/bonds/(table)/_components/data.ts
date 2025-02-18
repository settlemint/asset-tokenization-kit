import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllHasuraPages, fetchAllTheGraphPages } from '@/lib/utils/pagination';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { type Prettify, getAddress } from 'viem';

const BondFragment = theGraphGraphqlStarterkits(`
  fragment BondFields on Bond {
    id
    name
    symbol
    decimals
    totalSupply
    isMatured
    maturityDate
    paused
    faceValue
    underlyingAsset
    redeemedAmount
  }
`);

const Bonds = theGraphGraphqlStarterkits(
  `
  query Bonds($first: Int, $skip: Int) {
    bonds(orderBy: totalSupplyExact, orderDirection: desc, first: $first, skip: $skip) {
      ...BondFields
    }
  }
`,
  [BondFragment]
);

const OffchainBondFragment = hasuraGraphql(`
  fragment OffchainBondsFields on asset_aggregate {
      nodes {
        id
        private
      }
  }
`);

const OffchainBonds = hasuraGraphql(
  `
  query OffchainBonds($limit: Int, $offset: Int) {
    asset_aggregate(limit: $limit, offset: $offset) {
      ...OffchainBondsFields
    }
  }
`,
  [OffchainBondFragment]
);

export type BondAsset = Prettify<
  FragmentOf<typeof BondFragment> & FragmentOf<typeof OffchainBondFragment>['nodes'][number]
>;

export async function getBonds(): Promise<BondAsset[]> {
  const [theGraphBonds, nodes] = await Promise.all([
    fetchAllTheGraphPages(async (first, skip) => {
      const result = await theGraphClientStarterkits.request(Bonds, { first, skip });
      return result.bonds;
    }),
    fetchAllHasuraPages(async (limit, offset) => {
      const result = await hasuraClient.request(OffchainBonds, { limit, offset });
      return result.asset_aggregate.nodes;
    }),
  ]);

  const assetsById = new Map(nodes.map((asset) => [getAddress(asset.id), asset]));

  const bonds = theGraphBonds.map((bond) => {
    const dbAsset = assetsById.get(getAddress(bond.id));
    return {
      ...bond,
      ...(dbAsset
        ? dbAsset
        : {
            private: false,
          }),
    };
  });

  return bonds;
}
