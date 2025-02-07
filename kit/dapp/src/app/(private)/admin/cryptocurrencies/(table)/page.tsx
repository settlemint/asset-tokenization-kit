import { CryptocurrenciesTableClient } from '@/app/(private)/admin/cryptocurrencies/(table)/_components/table.client';
import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import { columns } from './_components/columns';
import { getCryptocurrencies } from './_components/data';

export const metadata: Metadata = {
  title: 'Cryptocurrencies',
  description: 'View and manage your cryptocurrencies.',
};

export default function CryptoCurrenciesPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="mb-6 font-bold text-3xl tracking-tight">Cryptocurrencies</h2>
      </div>
      <AssetTable assetConfig={assetConfig.cryptocurrency} dataAction={getCryptocurrencies} columns={columns}>
        <CryptocurrenciesTableClient />
      </AssetTable>
    </>
  );
}
