import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';

const CryptoCurrencyBalancesFragment = theGraphGraphqlStarterkits(`
  fragment CryptoCurrencyBalancesFields on AssetBalance {
      id
      value
  }
`);

const CryptoCurrencyBalances = theGraphGraphqlStarterkits(
  `
  query CryptoCurrencyBalances($id: ID!) {
    cryptoCurrency(id: $id) {
      asAccount {
        balances {
          ...CryptoCurrencyBalancesFields
        }
      }
    }
  }
`,
  [CryptoCurrencyBalancesFragment]
);

export type CryptoCurrencyHoldersBalance = FragmentOf<typeof CryptoCurrencyBalancesFragment>;

export async function getCryptoCurrencyBalances(id: string) {
  const data = await theGraphClientStarterkits.request(CryptoCurrencyBalances, { id });
  if (!data.cryptoCurrency) {
    throw new Error('CryptoCurrency not found');
  }
  return data.cryptoCurrency.asAccount.balances;
}
