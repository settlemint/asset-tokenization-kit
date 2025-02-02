'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const BondBalancesFragment = theGraphGraphqlStarterkits(`
  fragment BondBalancesFields on Bond {
    balances {
      id
      value
    }
  }
`);

const BondBalances = theGraphGraphqlStarterkits(
  `
  query BondBalances($id: ID!) {
    bond(id: $id) {
      ...BondBalancesFields
    }
  }
`,
  [BondBalancesFragment]
);

export type BondHoldersBalance = FragmentOf<typeof BondBalancesFragment>;

export async function getBondBalances(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(BondBalances, { id });
      if (!data.bond) {
        throw new Error('Bond not found');
      }
      return data.bond.balances;
    },
    [TokenType.Bond, id, 'balances'],
    {
      revalidate: 60,
      tags: [TokenType.Bond, `${TokenType.Bond}:${id}`, `${TokenType.Bond}:${id}:balances`],
    }
  )();
}
