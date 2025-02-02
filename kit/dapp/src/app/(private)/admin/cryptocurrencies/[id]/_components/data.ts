'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import { unstable_cache } from 'next/cache';

const CryptocurrencyTitle = theGraphGraphqlStarterkits(
  `
  query Cryptocurrency($id: ID!) {
    cryptoCurrency(id: $id) {
    id
    name
    symbol
    }
  }
`
);

export async function getCryptocurrencyTitle(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(CryptocurrencyTitle, { id });
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
