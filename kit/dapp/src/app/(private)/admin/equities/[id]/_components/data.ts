'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const EquityFragment = theGraphGraphqlStarterkits(`
  fragment EquityFields on Equity {
    id
    name
    symbol
  }
`);

const Equity = theGraphGraphqlStarterkits(
  `
  query Equity($id: ID!) {
    equity(id: $id) {
      ...EquityFields
    }
  }
`,
  [EquityFragment]
);

export type EquityAsset = FragmentOf<typeof EquityFragment>;

export async function getEquityTitle(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(Equity, { id });
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
