import { PageHeader } from '@/components/layout/page-header';
import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { StableCoinTable } from './_components/table';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'admin.stablecoins.table',
  });

  return {
    title: t('page-title'),
    description: t('page-description'),
  };
}

export default function StableCoinsPage() {
  const t = useTranslations('admin.stablecoins.table');
  return (
    <>
      <PageHeader title={t('page-title')} />
      <StableCoinTable />
    </>
  );
}
