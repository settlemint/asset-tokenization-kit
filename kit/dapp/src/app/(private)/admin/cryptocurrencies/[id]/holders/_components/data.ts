'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const CryptocurrencyBalancesFragment = theGraphGraphqlStarterkits(`
  fragment CryptocurrencyBalancesFields on CryptoCurrency {
    balances {
      id
      value
    }
  }
`);

const BondBalances = theGraphGraphqlStarterkits(
  `
  query CryptocurrencyBalances($id: ID!) {
    cryptoCurrency(id: $id) {
      ...CryptocurrencyBalancesFields
    }
  }
`,
  [CryptocurrencyBalancesFragment]
);

export type CryptocurrencyHoldersBalance = FragmentOf<typeof CryptocurrencyBalancesFragment>;

export async function getBondBalances(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(BondBalances, { id });
      if (!data.cryptoCurrency) {
        throw new Error('Cryptocurrency not found');
      }
      return data.cryptoCurrency.balances;
    },
    [TokenType.Cryptocurrency, id, 'balances'],
    {
      revalidate: 60,
      tags: [
        TokenType.Cryptocurrency,
        `${TokenType.Cryptocurrency}:${id}`,
        `${TokenType.Cryptocurrency}:${id}:balances`,
      ],
    }
  )();
}
