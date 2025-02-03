'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import { unstable_cache } from 'next/cache';

const FundDetails = theGraphGraphqlStarterkits(
  `
  query Fund($id: ID!) {
    fund(id: $id) {
    id
    name
    symbol
    decimals
    totalSupply
    fundCategory
    fundClass
    paused
    }
  }
`
);

export async function getFund(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(FundDetails, { id });
      if (!data.fund) {
        throw new Error('Fund not found');
      }
      return data.fund;
    },
    [TokenType.Fund, id, 'details'],
    {
      revalidate: 60,
      tags: [TokenType.Fund, `${TokenType.Fund}:${id}`, `${TokenType.Fund}:${id}:details`],
    }
  )();
}
