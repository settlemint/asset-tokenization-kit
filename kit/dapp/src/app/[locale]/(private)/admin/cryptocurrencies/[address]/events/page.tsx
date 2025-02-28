import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import { getCryptoCurrencyDetail } from '@/lib/queries/cryptocurrency/cryptocurrency-detail';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';

interface PageProps {
  params: Promise<{ locale: string; address: Address }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: Address }>;
}): Promise<Metadata> {
  const { address, locale } = await params;
  const cryptocurrency = await getCryptoCurrencyDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: 'admin.cryptocurrencies.events',
  });

  return {
    title: t('events-page-title', {
      name: cryptocurrency?.name,
    }),
    description: t('events-page-description', {
      name: cryptocurrency?.name,
    }),
  };
}

export default async function CryptoCurrencyEventsPage({ params }: PageProps) {
  const { address } = await params;

  return <AssetEventsTable asset={address} />;
}
