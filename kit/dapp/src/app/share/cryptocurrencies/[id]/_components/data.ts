import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';

const OgCryptoCurrency = theGraphGraphqlStarterkits(`
  query OgCryptoCurrency($id: ID!) {
    cryptoCurrency(id: $id) {
      name
      symbol
      totalSupply
    }
  }
`);

export async function getOgCryptoCurrency(id: string) {
  const { cryptoCurrency } = await theGraphClientStarterkits.request(
    OgCryptoCurrency,
    { id }
  );
  return cryptoCurrency;
}
