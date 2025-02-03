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
    collateral
    paused
  }
`);

const StableCoins = theGraphGraphqlStarterkits(
  `
  query StableCoins {
    stableCoins {
      ...StableCoinFields
    }
  }
`,
  [StableCoinFragment]
);

export type StableCoinList = FragmentOf<typeof StableCoinFragment>;

export async function getStableCoins() {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoins);
      return data.stableCoins;
    },
    [TokenType.Stablecoin],
    {
      revalidate: 60,
      tags: [TokenType.Stablecoin],
    }
  )();
}
