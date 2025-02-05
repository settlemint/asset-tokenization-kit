'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const StablecoinBalancesFragment = theGraphGraphqlStarterkits(`
  fragment StablecoinBalancesFields on AssetBalance {
      id
      value
  }
`);

const StablecoinBalances = theGraphGraphqlStarterkits(
  `
    query StablecoinBalances($id: ID!) {
    stableCoin(id: $id) {
      asAccount {
        balances {
          ...StablecoinBalancesFields
        }
      }
    }
  }
`,
  [StablecoinBalancesFragment]
);

export type StablecoinHoldersBalance = FragmentOf<typeof StablecoinBalancesFragment>;

export async function getStablecoinBalances(id: string) {
  const data = await theGraphClientStarterkits.request(StablecoinBalances, { id });
  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }
  return data.stableCoin.asAccount.balances;
}
