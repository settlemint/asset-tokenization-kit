'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const FundBalancesFragment = theGraphGraphqlStarterkits(`
  fragment FundBalancesFields on Fund {
    balances {
      id
      value
    }
  }
`);

const FundBalances = theGraphGraphqlStarterkits(
  `
  query FundBalances($id: ID!) {
    fund(id: $id) {
      ...FundBalancesFields
    }
  }
`,
  [FundBalancesFragment]
);

export type FundHoldersBalance = FragmentOf<typeof FundBalancesFragment>;

export async function getFundBalances(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(FundBalances, { id });
      if (!data.fund) {
        throw new Error('Fund not found');
      }
      return data.fund.balances;
    },
    [TokenType.Fund, id, 'balances'],
    {
      revalidate: 60,
      tags: [TokenType.Fund, `${TokenType.Fund}:${id}`, `${TokenType.Fund}:${id}:balances`],
    }
  )();
}
