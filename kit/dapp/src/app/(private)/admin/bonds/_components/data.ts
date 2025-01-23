'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

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

export function getBonds() {
  return unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(Bonds);
      return data.bonds;
    },
    ['bonds'],
    {
      revalidate: 10,
      tags: ['bonds'],
    }
  )();
}
