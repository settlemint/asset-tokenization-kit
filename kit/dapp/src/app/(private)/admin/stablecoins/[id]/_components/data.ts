'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const StableCoinTitle = theGraphGraphqlStarterkits(
  `
  query StableCoin($id: ID!) {
    stableCoin(id: $id) {
      id
      name
      symbol
      decimals
    }
  }
`
);

export async function getStableCoinTitle(id: string) {
  const data = await theGraphClientStarterkits.request(StableCoinTitle, { id });
  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }
  return data.stableCoin;
}
