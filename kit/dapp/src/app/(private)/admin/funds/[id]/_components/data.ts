'use server';

import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const FundFragment = theGraphGraphqlStarterkits(`
  fragment FundFields on Fund {
    id
    name
    symbol
  }
`);

const Fund = theGraphGraphqlStarterkits(
  `
  query Fund($id: ID!) {
    fund(id: $id) {
      ...FundFields
    }
  }
`,
  [FundFragment]
);

export type FundAsset = FragmentOf<typeof FundFragment>;

export async function getFundTitle(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(Fund, { id });
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
