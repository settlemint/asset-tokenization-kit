import MyAssetsTable from '@/components/blocks/my-assets-table/my-assets-table';
import { PageHeader } from '@/components/layout/page-header';
import { getUser } from '@/lib/auth/utils';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';

interface MyAssetsPageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function MyAssetsPage({ params }: MyAssetsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'portfolio.my-assets',
  });
  const user = await getUser();

  return (
    <>
      <PageHeader title={t('title')} section={t('portfolio-management')} />
      <MyAssetsTable wallet={user.wallet as Address} title={t('title')} />
    </>
  );
}
