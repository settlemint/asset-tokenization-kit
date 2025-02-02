'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const StableCoinBalancesFragment = theGraphGraphqlStarterkits(`
  fragment StableCoinBalancesFields on StableCoin {
    balances {
      id
      value
    }
  }
`);

const StableCoinBalances = theGraphGraphqlStarterkits(
  `
  query StableCoinBalances($id: ID!) {
    stableCoin(id: $id) {
      ...StableCoinBalancesFields
    }
  }
`,
  [StableCoinBalancesFragment]
);

export type StableCoinHoldersBalance = FragmentOf<typeof StableCoinBalancesFragment>;

export async function getStableCoinBalances(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoinBalances, { id });
      if (!data.stableCoin) {
        throw new Error('Stablecoin not found');
      }
      return data.stableCoin.balances;
    },
    [TokenType.Stablecoin, id, 'balances'],
    {
      revalidate: 60,
      tags: [TokenType.Stablecoin, `${TokenType.Stablecoin}:${id}`, `${TokenType.Stablecoin}:${id}:balances`],
    }
  )();
}
