import { DataTable } from '@/components/blocks/data-table/data-table';
import { getAssetDetail } from '@/lib/queries/asset/asset-detail';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import type { AssetType } from '../../types';
import { columns } from './_components/columns';

interface PageProps {
  params: Promise<{ locale: Locale; address: Address; assettype: AssetType }>;
}

export default async function PermissionsPage({ params }: PageProps) {
  const { address } = await params;
  const assetDetail = await getAssetDetail({ address });
  const t = await getTranslations('private.assets.details.permissions');

  return (
    <DataTable
      columnParams={{
        address,
      }}
      columns={columns}
      data={assetDetail.roles}
      name={t('table-title')}
    />
  );
}
