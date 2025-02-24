import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { Address } from 'viem';

const BalanceForAsset = theGraphGraphqlStarterkits(
  `
  query BalanceForAsset($user: ID!, $asset: String!) {
    account(id: $user) {
      balances(where: {asset: $asset}) {
        value
        valueExact
      }
    }
  }
`
);

export async function getBalanceForAsset(user: Address, asset: Address) {
  const data = await theGraphClientStarterkits.request(BalanceForAsset, { user, asset });

  if (!data.account) {
    throw new Error(`Could not get balance of user ${user} for asset ${asset}`);
  }

  const balance = data.account.balances.length > 0 ? data.account.balances[0].value : 0;
  return Number(balance);
}
