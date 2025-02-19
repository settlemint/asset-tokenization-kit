import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { PageHeader } from '@/components/layout/page-header';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import { columns } from './_components/columns';
import { getBonds } from './_components/data';
import { TableClient } from './_components/table-client';

export const metadata: Metadata = {
  title: 'Bonds',
  description: 'View and manage your bonds.',
};

export default function BondsPage() {
  return (
    <>
      <PageHeader title="Bonds" />
      <AssetTable assetConfig={assetConfig.bond} dataAction={getBonds} columns={columns}>
        <TableClient />
      </AssetTable>
    </>
  );
}
