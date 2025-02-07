import { icons } from '@/app/(private)/admin/equities/(table)/_components/columns';
import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import { columns } from './_components/columns';
import { getEquities } from './_components/data';

export const metadata: Metadata = {
  title: 'Equities',
  description: 'View and manage your equities.',
};

export default function EquitiesPage() {
  return (
    <>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">Equities</h2>
      </div>
      <AssetTable
        assetConfig={assetConfig.equity}
        dataAction={getEquities}
        columns={columns}
        icons={icons}
        refetchInterval={5000}
      />
    </>
  );
}
