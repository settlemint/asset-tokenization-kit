import { getAuthenticatedUser } from '@/lib/auth/auth';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const BalanceFragment = theGraphGraphqlStarterkits(`
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

const MyAsset = theGraphGraphqlStarterkits(
  `
  query MyAsset($accountId: ID!, $assetId: String!) {
    account(id: $accountId) {
      balances(where: { asset: $assetId }) {
        ...BalancesField
      }
    }
  }
`,
  [BalanceFragment]
);

export async function getMyAsset(assetId: string) {
  const user = await getAuthenticatedUser();
  const { account } = await theGraphClientStarterkits.request(MyAsset, { accountId: user.wallet, assetId });
  return account?.balances[0];
}
