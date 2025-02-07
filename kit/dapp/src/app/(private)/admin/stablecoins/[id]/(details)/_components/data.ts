'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const StableCoinDetails = theGraphGraphqlStarterkits(
  `
  query StableCoin($id: ID!) {
    stableCoin(id: $id) {
    id
    name
    symbol
    decimals
    totalSupply
    totalSupplyExact
    }
  }
`
);

export async function getStableCoin(id: string) {
  const data = await theGraphClientStarterkits.request(StableCoinDetails, { id });
  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }
  return data.stableCoin;
}
