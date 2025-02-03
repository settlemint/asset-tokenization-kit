'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const BondBalancesFragment = theGraphGraphqlStarterkits(`
  fragment BondBalancesFields on Bond {
    balances {
      id
      value
    }
  }
`);

const BondBalances = theGraphGraphqlStarterkits(
  `
  query BondBalances($id: ID!) {
    bond(id: $id) {
      ...BondBalancesFields
    }
  }
`,
  [BondBalancesFragment]
);

export type BondHoldersBalance = FragmentOf<typeof BondBalancesFragment>;

export async function getBondBalances(id: string) {
  const data = await theGraphClientStarterkits.request(BondBalances, { id });
  if (!data.bond) {
    throw new Error('Bond not found');
  }
  return data.bond.balances;
}
