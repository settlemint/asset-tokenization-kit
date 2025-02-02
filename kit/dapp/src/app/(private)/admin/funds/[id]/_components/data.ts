'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import { unstable_cache } from 'next/cache';

const FundTitle = theGraphGraphqlStarterkits(
  `
  query Fund($id: ID!) {
    fund(id: $id) {
     id
    name
    symbol
    }
  }
`
);

export async function getFundTitle(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(FundTitle, { id });
      if (!data.fund) {
        throw new Error('Fund not found');
      }
      return data.fund;
    },
    [TokenType.Fund, id, 'title'],
    {
      revalidate: 60,
      tags: [TokenType.Fund, `${TokenType.Fund}:${id}`, `${TokenType.Fund}:${id}:title`],
    }
  )();
}
