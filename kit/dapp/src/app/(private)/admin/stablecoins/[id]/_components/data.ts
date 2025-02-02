'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import { unstable_cache } from 'next/cache';

const StableCoinTitle = theGraphGraphqlStarterkits(
  `
  query StableCoin($id: ID!) {
    stableCoin(id: $id) {
    id
    name
    symbol    }
  }
`
);

export async function getStableCoinTitle(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoinTitle, { id });
      if (!data.stableCoin) {
        throw new Error('Stablecoin not found');
      }
      return data.stableCoin;
    },
    [TokenType.Stablecoin, id, 'title'],
    {
      revalidate: 60,
      tags: [TokenType.Stablecoin, `${TokenType.Stablecoin}:${id}`, `${TokenType.Stablecoin}:${id}:title`],
    }
  )();
}
