'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import { unstable_cache } from 'next/cache';

const StableCoinDetails = theGraphGraphqlStarterkits(
  `
  query StableCoin($id: ID!) {
    stableCoin(id: $id) {
    id
    name
    symbol
    decimals
    totalSupply
    }
  }
`
);

export async function getStableCoin(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoinDetails, { id });
      if (!data.stableCoin) {
        throw new Error('Stablecoin not found');
      }
      return data.stableCoin;
    },
    [TokenType.Stablecoin, id, 'details'],
    {
      revalidate: 60,
      tags: [TokenType.Stablecoin, `${TokenType.Stablecoin}:${id}`, `${TokenType.Stablecoin}:${id}:details`],
    }
  )();
}
