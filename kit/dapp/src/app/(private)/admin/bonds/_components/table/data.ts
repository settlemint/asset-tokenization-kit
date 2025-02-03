'use server';

import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { inArray } from 'drizzle-orm';
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

export type BondAsset = FragmentOf<typeof BondFragment>;

export async function getBonds() {
  const data = await theGraphClientStarterkits.request(Bonds);
  const theGraphBonds = data.bonds;

  const bondAddresses = theGraphBonds.map((bond) => bond.id);
  const dbBonds = await db
    .select()
    .from(asset)
    .where(inArray(asset.id, bondAddresses.map(getAddress)));

  const bonds = theGraphBonds.map((bond) => {
    const dbBond = dbBonds.find((b) => b.id === getAddress(bond.id));
    return {
      ...bond,
      ...(dbBond
        ? dbBond
        : {
            private: false,
            organizationId: '',
          }),
    };
  });

  return bonds;
}
