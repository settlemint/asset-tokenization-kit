'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const EquityBalancesFragment = theGraphGraphqlStarterkits(`
  fragment EquityBalancesFields on Equity {
    balances {
      id
      value
    }
  }
`);

const EquityBalances = theGraphGraphqlStarterkits(
  `
  query EquityBalances($id: ID!) {
    equity(id: $id) {
      ...EquityBalancesFields
    }
  }
`,
  [EquityBalancesFragment]
);

export type EquityHoldersBalance = FragmentOf<typeof EquityBalancesFragment>;

export async function getEquityBalances(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(EquityBalances, { id });
      if (!data.equity) {
        throw new Error('Equity not found');
      }
      return data.equity.balances;
    },
    [TokenType.Equity, id, 'balances'],
    {
      revalidate: 60,
      tags: [TokenType.Equity, `${TokenType.Equity}:${id}`, `${TokenType.Equity}:${id}:balances`],
    }
  )();
}
