import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { columns } from './_components/columns';
import { getCryptocurrencies } from './_components/data';

export default function CryptoCurrenciesPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Cryptocurrencies</h2>
      </div>
      <AssetTable type="cryptocurrencies" dataAction={getCryptocurrencies} columns={columns} />
    </>
  );
}
