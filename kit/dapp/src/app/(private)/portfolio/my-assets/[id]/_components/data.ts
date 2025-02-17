import { getAuthenticatedUser } from '@/lib/auth/auth';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const BalanceFragmentMyAsset = theGraphGraphqlStarterkits(`
  fragment BalancesFieldMyAsset on AssetBalance {
    value
    asset {
      __typename
      id
      name
      symbol
      decimals
      type
      totalSupply
      ... on StableCoin {
        stableCoinIsin: isin
        paused
        collateral
      }
      ... on Bond {
        bondIsin: isin
        paused
      }
      ... on Fund {
        fundIsin: isin
        paused
      }
      ... on Equity {
        equityIsin: isin
        paused
      }
    }
  }
`);

const MyAsset = theGraphGraphqlStarterkits(
  `
  query MyAsset($accountId: ID!, $assetId: String!) {
    account(id: $accountId) {
      balances(where: { asset: $assetId }) {
        ...BalancesFieldMyAsset
      }
    }
  }
`,
  [BalanceFragmentMyAsset]
);

export async function getMyAsset(assetId: string) {
  const user = await getAuthenticatedUser();
  const { account } = await theGraphClientStarterkits.request(MyAsset, { accountId: user.wallet, assetId });
  return account?.balances[0];
}
