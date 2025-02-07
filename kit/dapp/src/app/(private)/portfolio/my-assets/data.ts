import { getSession } from "@/lib/auth/auth";
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from "@/lib/settlemint/the-graph";
import type { FragmentOf } from "@settlemint/sdk-hasura";

export const BalanceFragment = theGraphGraphqlStarterkits(`
  fragment BalancesField on AssetBalance {
    valueExact
    asset {
      __typename
      id
      name
      symbol
      type
      totalSupply
      totalSupplyExact
      ... on StableCoin {
        isin
        paused
        collateral
        collateralExact
      }
    }
  }
`);

const MyAssets = theGraphGraphqlStarterkits(
  `
  query MyAssets($accountId: ID!) {
    account(id: $accountId) {
      id
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
