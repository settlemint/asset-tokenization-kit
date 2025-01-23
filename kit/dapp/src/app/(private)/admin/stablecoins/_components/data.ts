'use server';

import type { BaseAsset } from '@/components/blocks/asset-table/asset-table-columns';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

const StableCoinFragment = theGraphGraphqlStarterkits(`
  fragment StableCoinFields on StableCoin {
    id
    name
    symbol
    decimals
    totalSupply
    collateral
    paused
  }
`);

const StableCoins = theGraphGraphqlStarterkits(
  `
  query StableCoins {
    stableCoins {
      ...StableCoinFields
    }
  }
`,
  [StableCoinFragment]
);

export type StableCoinAsset = FragmentOf<typeof StableCoinFragment> & BaseAsset;

export function getStableCoins() {
  return unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoins);
      return data.stableCoins;
    },
    ['stablecoins'],
    {
      revalidate: 10,
      tags: ['stablecoins'],
    }
  )();
}
