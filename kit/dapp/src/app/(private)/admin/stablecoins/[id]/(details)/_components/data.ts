'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const StableCoinFragment = theGraphGraphqlStarterkits(`
  fragment StableCoinFields on StableCoin {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);

const StableCoin = theGraphGraphqlStarterkits(
  `
  query StableCoin($id: ID!) {
    stableCoin(id: $id) {
      ...StableCoinFields
    }
  }
`,
  [StableCoinFragment]
);

export type StableCoinAsset = FragmentOf<typeof StableCoinFragment>;

export async function getStableCoin(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoin, { id });
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
