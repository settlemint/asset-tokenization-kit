import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { assetConfig } from '@/lib/config/assets';
import { columns } from './_components/table/columns';
import { getCryptocurrencies } from './_components/table/data';

export default function CryptoCurrenciesPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Cryptocurrencies</h2>
      </div>
      <AssetTable
        assetConfig={assetConfig.cryptocurrency}
        dataAction={getCryptocurrencies}
        columns={columns}
        refetchInterval={5000}
      />
    </>
  );
}
