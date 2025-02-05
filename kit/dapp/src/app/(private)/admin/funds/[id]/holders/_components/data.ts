'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const FundBalancesFragment = theGraphGraphqlStarterkits(`
  fragment FundBalancesFields on AssetBalance {
      id
      value
  }
`);

const FundBalances = theGraphGraphqlStarterkits(
  `
  query FundBalances($id: ID!) {
    fund(id: $id) {
      asAccount {
        balances {
          ...FundBalancesFields
        }
      }
    }
  }
`,
  [FundBalancesFragment]
);

export type FundHoldersBalance = FragmentOf<typeof FundBalancesFragment>;

export async function getFundBalances(id: string) {
  const data = await theGraphClientStarterkits.request(FundBalances, { id });
  if (!data.fund) {
    throw new Error('Fund not found');
  }
  return data.fund.asAccount.balances;
}
