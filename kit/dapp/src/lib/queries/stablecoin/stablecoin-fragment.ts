import { hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

export const StableCoinFragment = theGraphGraphqlStarterkits(`
  fragment StableCoinFragment on StableCoin {
    id
    name
    symbol
    decimals
    totalSupply
    collateral
    paused
    creator {
      id
    }
  }
`);
export type StableCoin = FragmentOf<typeof StableCoinFragment>;

export const OffchainStableCoinFragment = hasuraGraphql(`
  fragment OffchainStableCoinFragment on asset {
    id
    private
  }
`);
export type OffchainStableCoin = FragmentOf<typeof OffchainStableCoinFragment>;
