import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { defaultAssetTableColumns } from '@/components/blocks/asset-table/asset-table-columns';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';

const StableCoinFragment = theGraphGraphqlStarterkits(`
  fragment StableCoinFields on StableCoin {
    id
    name
    symbol
    decimals
    totalSupply
  }
`);

const StableCoins = theGraphGraphqlStarterkits(
  `
  query StableCoins {
    stableCoins {
      ...StableCoinFields
    }
  }
`,
  [StableCoinFragment]
);

async function getStableCoins() {
  'use server';
  const data = await theGraphClientStarterkits.request(StableCoins);
  return data.stableCoins;
}

export default function StableCoinsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Stable Coins</h2>
      </div>
      <AssetTable type="stablecoins" dataAction={getStableCoins} columns={defaultAssetTableColumns('stablecoins')} />
    </>
  );
}
