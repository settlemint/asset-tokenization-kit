import { AssetTable } from '@/components/blocks/asset-table/asset-table';
import { PageHeader } from '@/components/layout/page-header';
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
      <PageHeader title="Equities" />
      <AssetTable assetConfig={assetConfig.equity} dataAction={getEquities} columns={columns} />
    </>
  );
}
