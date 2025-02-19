'use server';

import { getAuthenticatedUser } from '@/lib/auth/auth';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';
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
  query MyAssets($accountId: ID!, $first: Int, $skip: Int) {
    account(id: $accountId) {
      balances(first: $first, skip: $skip) {
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
  return fetchAllTheGraphPages(async (first, skip) => {
    const result = await theGraphClientStarterkits.request(MyAssets, { accountId: user.wallet, first, skip });
    const { account } = result;

    const total =
      account?.balances.reduce((acc, balance) => acc.plus(BigNumber(balance.value)), BigNumber(0)) ?? BigNumber(0);

    return (
      account?.balances.map((balance) => ({
        ...balance,
        percentage: total.gt(0) ? BigNumber(balance.value).div(total).multipliedBy(100).toNumber() : 0,
      })) ?? []
    );
  });
}
