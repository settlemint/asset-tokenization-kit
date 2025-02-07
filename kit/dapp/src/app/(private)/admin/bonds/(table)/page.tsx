import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import { columns, icons } from './_components/columns';
import { getBonds } from './_components/data';

export const metadata: Metadata = {
  title: 'Bonds',
  description: 'View and manage your bonds.',
};

export default function BondsPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Bonds</h2>
      </div>
      <AssetTable
        assetConfig={assetConfig.bond}
        dataAction={getBonds}
        columns={columns}
        icons={icons}
        refetchInterval={5000}
      />
    </>
  );
}
