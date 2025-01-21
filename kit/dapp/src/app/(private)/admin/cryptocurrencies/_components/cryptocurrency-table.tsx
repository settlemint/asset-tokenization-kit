import { DataTable } from '@/components/blocks/data-table/data-table';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import type { FragmentOf } from '@settlemint/sdk-thegraph';
import { columns } from './cryptocurrency-table-columns';
import { icons } from './cryptocurrency-table-icons';

const CryptoCurrencyFragment = theGraphGraphqlStarterkits(`
  fragment CryptoCurrencyFields on CryptoCurrency {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);
export type CryptoCurrency = FragmentOf<typeof CryptoCurrencyFragment>;

const CryptoCurrencies = theGraphGraphqlStarterkits(
  `
  query CryptoCurrencies {
    cryptoCurrencies {
      ...CryptoCurrencyFields
    }
  }
`,
  [CryptoCurrencyFragment]
);

export async function CryptocurrencyTable() {
  const { cryptoCurrencies } = await theGraphClientStarterkits.request(CryptoCurrencies);

  return <DataTable columns={columns} data={cryptoCurrencies} icons={icons} name="cryptocurrencies" />;
}
