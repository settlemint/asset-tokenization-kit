import { theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

export const BalanceFragment = theGraphGraphqlStarterkits(`
  fragment BalanceFragment on AssetBalance {
    blocked
    frozen
    value
    account {
      id
      lastActivity
    }
  }
`);
export type Balance = FragmentOf<typeof BalanceFragment>;
