import { DataTable } from '@/components/blocks/data-table/data-table';
import { PageHeader } from '@/components/layout/page-header';
import { getBondList } from '@/lib/queries/bond/bond-list';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useBondColumns } from './_components/columns';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'admin.bonds.table',
  });

  return {
    title: t('page-title'),
    description: t('page-description'),
  };
}

export default async function BondsPage() {
  const t = await getTranslations('admin.bonds.table');
  const bonds = await getBondList();

  return (
    <>
      <PageHeader title={t('page-title')} />

      <DataTable columnHook={useBondColumns} data={bonds} name={'bonds'} />
    </>
  );
}
