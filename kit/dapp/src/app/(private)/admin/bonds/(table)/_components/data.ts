import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { getAddress } from 'viem';

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

const OffchainBonds = hasuraGraphql(`
  query OffchainBonds($_in: [String!]) {
    asset_aggregate(where: {id: {_in: $_in}}) {
      nodes {
        id
        private
      }
    }
  }
`);

export type BondAsset = FragmentOf<typeof BondFragment>;

export async function getBonds() {
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
