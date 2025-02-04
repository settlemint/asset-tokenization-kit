'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const CryptocurrencyBalancesFragment = theGraphGraphqlStarterkits(`
  fragment CryptocurrencyBalancesFields on CryptoCurrency {
    balances {
      id
      value
    }
  }
`);

const CryptocurrencyBalances = theGraphGraphqlStarterkits(
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

export async function getCryptocurrencyBalances(id: string) {
  const data = await theGraphClientStarterkits.request(CryptocurrencyBalances, { id });
  if (!data.cryptoCurrency) {
    throw new Error('Cryptocurrency not found');
  }
  return data.cryptoCurrency.balances;
}
