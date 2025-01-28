'use server';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { TokenType } from '@/types/token-types';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { unstable_cache } from 'next/cache';

/** List */
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

export type StableCoinAsset = FragmentOf<typeof StableCoinFragment> & {
  isin?: string | null;
  totalSupplyExact?: string;
  collateralExact?: string;
};

export async function getStableCoins() {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoins);
      return data.stableCoins;
    },
    [TokenType.Stablecoin],
    {
      revalidate: 60,
      tags: [TokenType.Stablecoin],
    }
  )();
}

/** Detail */

const StableCoin = theGraphGraphqlStarterkits(
  `
  query StableCoin($id: Bytes!) {
  stableCoins(
    where: {id: $id }
  ) {
    ...StableCoinFields
  }
  }
`,
  [StableCoinFragment]
);

export async function getStableCoin(id: string) {
  return await unstable_cache(
    async () => {
      const data = await theGraphClientStarterkits.request(StableCoin, { id });
      const stableCoin = data.stableCoins[0];

      if (!stableCoin) {
        throw new Error(`Stablecoin with id ${id} not found`);
      }
      return stableCoin;
    },
    [`stablecoin-${id}`],
    {
      revalidate: 60,
      tags: [`stablecoin-${id}`],
    }
  )();
}
