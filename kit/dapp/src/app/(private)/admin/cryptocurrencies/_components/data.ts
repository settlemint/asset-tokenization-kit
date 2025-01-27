'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const CryptoCurrencyFragment = theGraphGraphqlStarterkits(`
  fragment CryptoCurrencyFields on CryptoCurrency {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);

const CryptoCurrencies = theGraphGraphqlStarterkits(
  `
  query CryptoCurrencies {
    cryptoCurrencies {
      ...CryptoCurrencyFields
    }
  }
`,
  [CryptoCurrencyFragment]
);

export type CryptoCurrencyAsset = FragmentOf<typeof CryptoCurrencyFragment>;

export async function getCryptocurrencies() {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(CryptoCurrencies);
      return data.cryptoCurrencies;
    },
    [TokenType.Cryptocurrency],
    {
      revalidate: 60,
      tags: [TokenType.Cryptocurrency],
    }
  )();
}
