import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';

const OgEquity = theGraphGraphqlStarterkits(`
  query OgEquity($id: ID!) {
    equity(id: $id) {
      name
      symbol
      totalSupply
      equityCategory
      equityClass
    }
  }
`);

export async function getOgEquity(id: string) {
  const { equity } = await theGraphClientStarterkits.request(OgEquity, { id });
  return equity;
}
