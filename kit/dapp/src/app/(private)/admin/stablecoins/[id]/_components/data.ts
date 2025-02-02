'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const StableCoinDetailFragment = theGraphGraphqlStarterkits(`
  fragment StableCoinDetailFields on StableCoin {
    id
    name
    symbol
    decimals
    totalSupply
    collateral
    paused
    isin
  }
`);

const StableCoin = theGraphGraphqlStarterkits(
  `
  query StableCoin($id: Bytes!) {
  stableCoins(
    where: {id: $id }
  ) {
    ...StableCoinDetailFields
  }
  }
`,
  [StableCoinDetailFragment]
);

export type StableCoinDetail = FragmentOf<typeof StableCoinDetailFragment>;

export async function getStableCoin(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoin, { id });
      const stableCoin = data.stableCoins[0];

      if (!stableCoin) {
        throw new Error(`Stablecoin with id ${id} not found`);
      }
      return stableCoin;
    },
    [TokenType.Stablecoin, id],
    {
      revalidate: 60,
      tags: [TokenType.Stablecoin],
    }
  )();
}
