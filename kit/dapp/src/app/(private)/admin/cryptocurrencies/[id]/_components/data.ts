'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

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
  const data = await theGraphClientStarterkits.request(CryptocurrencyTitle, { id });
  if (!data.cryptoCurrency) {
    throw new Error('Cryptocurrency not found');
  }
  return data.cryptoCurrency;
}
