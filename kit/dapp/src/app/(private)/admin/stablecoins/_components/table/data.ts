'use server';
import { db } from '@/lib/db';
import { asset } from '@/lib/db/schema-asset-tokenization';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { inArray } from 'drizzle-orm';
import { getAddress } from 'viem';

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

export type StableCoinList = FragmentOf<typeof StableCoinFragment>;

export async function getStableCoins() {
  const data = await theGraphClientStarterkits.request(StableCoins);
  const theGraphStableCoins = data.stableCoins;

  const stableCoinAddresses = theGraphStableCoins.map((stableCoin) => stableCoin.id);
  const dbStableCoins = await db
    .select()
    .from(asset)
    .where(inArray(asset.id, stableCoinAddresses.map(getAddress)));

  const stableCoins = theGraphStableCoins.map((stableCoin) => {
    const dbStableCoin = dbStableCoins.find((s) => s.id === getAddress(stableCoin.id));
    return {
      ...stableCoin,
      ...(dbStableCoin
        ? dbStableCoin
        : {
            private: false,
          }),
    };
  });

  return stableCoins;
}
