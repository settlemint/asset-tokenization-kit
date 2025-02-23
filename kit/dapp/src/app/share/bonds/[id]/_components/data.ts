import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';

const OgBond = theGraphGraphqlStarterkits(`
  query OgBond($id: ID!) {
    bond(id: $id) {
      name
      symbol
      totalSupply
      maturityDate
      faceValue
    }
  }
`);

export async function getOgBond(id: string) {
  const { bond } = await theGraphClientStarterkits.request(OgBond, { id });
  return bond;
}
