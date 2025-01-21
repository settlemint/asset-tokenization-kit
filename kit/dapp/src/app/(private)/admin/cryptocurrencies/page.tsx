import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const CryptoCurrencyFragment = theGraphGraphqlStarterkits(`
  fragment CryptoCurrencyFields on CryptoCurrency {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);

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

async function getCryptocurrencies() {
  'use server';
  const data = await theGraphClientStarterkits.request(CryptoCurrencies);
  return data.cryptoCurrencies;
}

export default function EquityPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Crypto Currencies</h2>
      </div>
      <AssetTable type="cryptocurrencies" dataAction={getCryptocurrencies} />
    </>
  );
}
