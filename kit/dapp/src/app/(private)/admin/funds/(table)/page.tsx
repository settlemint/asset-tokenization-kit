import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import { columns } from './_components/columns';
import { getFunds } from './_components/data';
import { FundsTableClient } from './_components/table.client';

export const metadata: Metadata = {
  title: 'Funds',
  description: 'View and manage your funds.',
};

export default function FundsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Funds</h2>
      </div>
      <AssetTable assetConfig={assetConfig.fund} dataAction={getFunds} columns={columns}>
        <FundsTableClient />
      </AssetTable>
    </>
  );
}
