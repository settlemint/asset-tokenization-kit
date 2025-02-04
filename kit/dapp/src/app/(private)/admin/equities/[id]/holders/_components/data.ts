'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const EquityBalancesFragment = theGraphGraphqlStarterkits(`
  fragment EquityBalancesFields on Equity {
    balances {
      id
      value
    }
  }
`);

const EquityBalances = theGraphGraphqlStarterkits(
  `
  query EquityBalances($id: ID!) {
    equity(id: $id) {
      ...EquityBalancesFields
    }
  }
`,
  [EquityBalancesFragment]
);

export type EquityHoldersBalance = FragmentOf<typeof EquityBalancesFragment>;

export async function getEquityBalances(id: string) {
  const data = await theGraphClientStarterkits.request(EquityBalances, { id });
  if (!data.equity) {
    throw new Error('Equity not found');
  }
  return data.equity.balances;
}
