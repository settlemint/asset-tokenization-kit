import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
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
  query Bonds {
    bonds {
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
  query OffchainBonds {
    asset_aggregate {
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
  const [theGraphData, dbAssets] = await Promise.all([
    theGraphClientStarterkits.request(Bonds),
    hasuraClient.request(OffchainBonds),
  ]);

  const theGraphBonds = theGraphData.bonds;
  const assetsById = new Map(dbAssets.asset_aggregate.nodes.map((asset) => [getAddress(asset.id), asset]));

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
