'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const BondFragment = theGraphGraphqlStarterkits(`
  fragment BondFields on Bond {
    id
    name
    symbol
  }
`);

const Bond = theGraphGraphqlStarterkits(
  `
  query Bond($id: ID!) {
    bond(id: $id) {
      ...BondFields
    }
  }
`,
  [BondFragment]
);

export type BondAsset = FragmentOf<typeof BondFragment>;

export async function getBondTitle(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(Bond, { id });
      if (!data.bond) {
        throw new Error('Bond not found');
      }
      return data.bond;
    },
    [TokenType.Bond, id, 'title'],
    {
      revalidate: 60,
      tags: [TokenType.Bond, `${TokenType.Bond}:${id}`, `${TokenType.Bond}:${id}:title`],
    }
  )();
}
