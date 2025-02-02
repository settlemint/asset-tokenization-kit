'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const CryptocurrencyFragment = theGraphGraphqlStarterkits(`
  fragment CryptocurrencyFields on CryptoCurrency {
    id
    name
    symbol
  }
`);

const Cryptocurrency = theGraphGraphqlStarterkits(
  `
  query Cryptocurrency($id: ID!) {
    cryptoCurrency(id: $id) {
      ...CryptocurrencyFields
    }
  }
`,
  [CryptocurrencyFragment]
);

export type CryptocurrencyAsset = FragmentOf<typeof CryptocurrencyFragment>;

export async function getCryptocurrencyTitle(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(Cryptocurrency, { id });
      if (!data.cryptoCurrency) {
        throw new Error('Cryptocurrency not found');
      }
      return data.cryptoCurrency;
    },
    [TokenType.Cryptocurrency, id, 'title'],
    {
      revalidate: 60,
      tags: [TokenType.Cryptocurrency, `${TokenType.Cryptocurrency}:${id}`, `${TokenType.Cryptocurrency}:${id}:title`],
    }
  )();
}
