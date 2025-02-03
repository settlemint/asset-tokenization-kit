'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

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
  const data = await theGraphClientStarterkits.request(StableCoinBalances, { id });
  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }
  return data.stableCoin.balances;
}
