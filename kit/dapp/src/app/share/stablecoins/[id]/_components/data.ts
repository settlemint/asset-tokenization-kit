import {
  theGraphClientStarterkits,
  theGraphGraphqlStarterkits,
} from '@/lib/settlemint/the-graph';

const OgStablecoin = theGraphGraphqlStarterkits(`
  query OgStablecoin($id: ID!) {
    stableCoin(id: $id) {
      name
      symbol
      totalSupply
      collateral
    }
  }
`);

export async function getOgStablecoin(id: string) {
  const { stableCoin } = await theGraphClientStarterkits.request(OgStablecoin, {
    id,
  });
  return stableCoin;
}
