import { getAuthenticatedUser } from '@/lib/auth/auth';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { fetchAllTheGraphPages } from '../../../../lib/utils/pagination';

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
  const balances = await fetchAllTheGraphPages(async (first, skip) => {
    const result = await theGraphClientStarterkits.request(MyAssets, { accountId: user.wallet, first, skip });
    return result.account?.balances ?? [];
  });
  return balances;
}
