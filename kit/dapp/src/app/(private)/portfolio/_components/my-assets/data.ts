'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import BigNumber from 'bignumber.js';

const BalanceFragment = theGraphGraphqlStarterkits(`
  fragment BalancesField on AssetBalance {
    value
    asset {
      id
      name
      symbol
      type
      ... on StableCoin {
        paused
      }
      ... on Bond {
        paused
      }
      ... on Fund {
        paused
      }
      ... on Equity {
        paused
      }
    }
  }
`);

const MyAssets = theGraphGraphqlStarterkits(
  `
  query MyAssets($accountId: ID!) {
    account(id: $accountId) {
      balances {
        ...BalancesField
      }
    }
  }
`,
  [BalanceFragment]
);

export type MyAsset = FragmentOf<typeof BalanceFragment>;

export async function getMyAssets() {
  const user = await getAuthenticatedUser();
  const { account } = await theGraphClientStarterkits.request(MyAssets, { accountId: user.wallet });

  const total =
    account?.balances.reduce((acc, balance) => acc.plus(BigNumber(balance.value)), BigNumber(0)) ?? BigNumber(0);

  return (
    account?.balances.map((balance) => ({
      ...balance,
      percentage: total.gt(0) ? BigNumber(balance.value).div(total).multipliedBy(100).toNumber() : 0,
    })) ?? []
  );
}
