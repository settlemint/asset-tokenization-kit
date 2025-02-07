import { getSession } from "@/lib/auth/auth";
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from "@/lib/settlemint/the-graph";
import { BalanceFragment } from "../../../data";

const MyAsset = theGraphGraphqlStarterkits(
  `
  query MyAsset($accountId: ID!, $assetId: String!) {
    account(id: $accountId) {
      id
      balances(where: { asset: $assetId }) {
        ...BalancesField
      }
    }
  }
`,
  [BalanceFragment],
);

export async function getMyAsset(assetId: string) {
  const session = await getSession();
  const { account } = await theGraphClientStarterkits.request(MyAsset, { accountId: session.user.wallet, assetId });
  return account?.balances[0];
}
