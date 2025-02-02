'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import { unstable_cache } from 'next/cache';

const EquityTitle = theGraphGraphqlStarterkits(
  `
  query Equity($id: ID!) {
    equity(id: $id) {
    id
    name
    symbol    }
  }
`
);

export async function getEquityTitle(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(EquityTitle, { id });
      if (!data.equity) {
        throw new Error('Equity not found');
      }
      return data.equity;
    },
    [TokenType.Equity, id, 'title'],
    {
      revalidate: 60,
      tags: [TokenType.Equity, `${TokenType.Equity}:${id}`, `${TokenType.Equity}:${id}:title`],
    }
  )();
}
