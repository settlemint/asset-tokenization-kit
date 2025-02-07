import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

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
  const data = await theGraphClientStarterkits.request(CryptocurrencyDetails, { id });
  if (!data.cryptoCurrency) {
    throw new Error('Cryptocurrency not found');
  }
  return data.cryptoCurrency;
}
