'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import { unstable_cache } from 'next/cache';

const CryptocurrencyDetails = theGraphGraphqlStarterkits(
  `
  query Cryptocurrency($id: ID!) {
    cryptoCurrency(id: $id) {
    id
    name
    symbol
    decimals
    totalSupply
    }
  }
`
);

export async function getCryptocurrency(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(CryptocurrencyDetails, { id });
      if (!data.cryptoCurrency) {
        throw new Error('Cryptocurrency not found');
      }
      return data.cryptoCurrency;
    },
    [TokenType.Cryptocurrency, id, 'details'],
    {
      revalidate: 60,
      tags: [
        TokenType.Cryptocurrency,
        `${TokenType.Cryptocurrency}:${id}`,
        `${TokenType.Cryptocurrency}:${id}:details`,
      ],
    }
  )();
}
