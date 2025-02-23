import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';

const OgFund = theGraphGraphqlStarterkits(`
  query OgFund($id: ID!) {
    fund(id: $id) {
      name
      symbol
      totalSupply
      fundClass
      fundCategory
    }
  }
`);

export async function getOgFund(id: string) {
  const { fund } = await theGraphClientStarterkits.request(OgFund, { id });
  return fund;
}
