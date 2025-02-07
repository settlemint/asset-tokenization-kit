import { getSession } from "@/lib/auth/auth";
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from "@/lib/settlemint/the-graph";
import type { FragmentOf } from "@settlemint/sdk-hasura";

const BalanceFragment = theGraphGraphqlStarterkits(`
  fragment BalancesField on AssetBalance {
    valueExact
    asset {
      id
      name
      symbol
      type
      ... on StableCoin {
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
  [BalanceFragment],
);

export type MyAsset = FragmentOf<typeof BalanceFragment>;

export async function getMyAssets() {
  const session = await getSession();
  const { account } = await theGraphClientStarterkits.request(MyAssets, { accountId: session.user.wallet });
  return account?.balances ?? [];
}
