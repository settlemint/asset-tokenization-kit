'use server';

import type { BaseAsset } from '@/components/blocks/asset-table/asset-table-columns';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const FundFragment = theGraphGraphqlStarterkits(`
  fragment FundFields on Fund {
    id
    name
    symbol
    decimals
    totalSupply
    fundCategory
    fundClass
    paused
  }
`);

const Funds = theGraphGraphqlStarterkits(
  `
  query Funds {
    funds {
      ...FundFields
    }
  }
`,
  [FundFragment]
);

export type FundAsset = FragmentOf<typeof FundFragment> & BaseAsset;

export async function getFunds() {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(Funds);
      return data.funds;
    },
    [TokenType.Fund],
    {
      revalidate: 60,
      tags: [TokenType.Fund],
    }
  )();
}
