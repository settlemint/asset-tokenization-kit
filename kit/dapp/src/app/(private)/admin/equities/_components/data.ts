'use server';

import type { BaseAsset } from '@/components/blocks/asset-table/asset-table-columns';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const EquityFragment = theGraphGraphqlStarterkits(`
  fragment EquityFields on Equity {
    id
    name
    symbol
    decimals
    totalSupply
    equityCategory
    equityClass
    paused
  }
`);

const Equities = theGraphGraphqlStarterkits(
  `
  query Equities {
    equities {
      ...EquityFields
    }
  }
`,
  [EquityFragment]
);

export type EquityAsset = FragmentOf<typeof EquityFragment> & BaseAsset;

export function getEquities() {
  return unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(Equities);
      return data.equities;
    },
    ['equities'],
    {
      revalidate: 10,
      tags: ['equities'],
    }
  )();
}
