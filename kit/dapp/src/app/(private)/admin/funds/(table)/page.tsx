import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { PageHeader } from '@/components/layout/page-header';
import { assetConfig } from '@/lib/config/assets';
import type { Metadata } from 'next';
import { columns } from './_components/columns';
import { getFunds } from './_components/data';
import { TableClient } from './_components/table-client';

export const metadata: Metadata = {
  title: 'Funds',
  description: 'View and manage your funds.',
};

export default function FundsPage() {
  return (
    <>
      <PageHeader title="Funds" />
      <AssetTable assetConfig={assetConfig.fund} dataAction={getFunds} columns={columns}>
        <TableClient />
      </AssetTable>
    </>
  );
}
