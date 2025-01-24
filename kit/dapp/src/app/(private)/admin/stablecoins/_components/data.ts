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

export async function getStableCoins() {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoins);
      // return data.stableCoins;
      return [
        {
          id: '0x43576e1a3f1C01D205E9D802Ad5573f6C5624E88',
          name: 'USDC',
          symbol: 'USDC',
          decimals: 6,
          totalSupply: 1000000,
          collateral: 'USD',
          paused: true,
        },
      ];
    },
    ['stablecoins'],
    {
      revalidate: 10,
      tags: ['stablecoins'],
    }
  )();
}
