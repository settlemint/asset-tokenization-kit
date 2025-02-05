'use server';

import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { inArray } from 'drizzle-orm';
import { getAddress } from 'viem';

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
  const data = await theGraphClientStarterkits.request(CryptoCurrencies);
  const theGraphCryptocurrencies = data.cryptoCurrencies;

  const cryptocurrencyAddresses = theGraphCryptocurrencies.map((cryptocurrency) => cryptocurrency.id);
  const dbCryptocurrencies = await db
    .select()
    .from(asset)
    .where(inArray(asset.id, cryptocurrencyAddresses.map(getAddress)));

  const cryptocurrencies = theGraphCryptocurrencies.map((cryptocurrency) => {
    const dbCryptocurrency = dbCryptocurrencies.find((c) => c.id === getAddress(cryptocurrency.id));
    return {
      ...cryptocurrency,
      ...(dbCryptocurrency
        ? dbCryptocurrency
        : {
            private: false,
          }),
    };
  });

  return cryptocurrencies;
}
