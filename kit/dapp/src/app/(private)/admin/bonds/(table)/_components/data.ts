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
  const data = await theGraphClientStarterkits.request(Bonds);
  const theGraphBonds = data.bonds;
  const bondAddresses = theGraphBonds.map((bond) => getAddress(bond.id));

  const dbBonds = await hasuraClient.request(OffchainBonds, {
    _in: bondAddresses,
  });

  const bonds = theGraphBonds.map((bond) => {
    const dbBond = dbBonds.asset_aggregate.nodes.find((b) => b.id === getAddress(bond.id));
    return {
      ...bond,
      ...(dbBond
        ? dbBond
        : {
            private: false,
          }),
    };
  });

  return bonds;
}
