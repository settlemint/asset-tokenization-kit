import { DataTable } from '@/components/blocks/data-table/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { getAssetDetail } from '@/lib/queries/asset/asset-detail';
import { getEquityDetail } from '@/lib/queries/equity/equity-detail';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { usePermissionsColumns } from './_components/columns';

interface PageProps {
  params: Promise<{ locale: string; address: Address }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: Address }>;
}): Promise<Metadata> {
  const { address, locale } = await params;
  const equity = await getEquityDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: 'admin.equities.permissions',
  });

  return {
    title: t('permissions-page-title', {
      name: equity?.name,
    }),
    description: t('permissions-page-description', {
      name: equity?.name,
    }),
  };
}

export default async function EquityTokenPermissionsPage({
  params,
}: PageProps) {
  const { address } = await params;
  const equity = await getEquityDetail({ address });
  const assetDetail = await getAssetDetail({ address });
  const t = await getTranslations('admin.equities.permissions');

  return (
    <>
      <PageHeader
        title={t('page-title', { name: equity?.name })}
        subtitle={t('page-description', { name: equity?.name })}
      />
      <DataTable
        columnHook={usePermissionsColumns}
        data={assetDetail.roles}
        name={t('table-title')}
      />
    </>
  );
}
