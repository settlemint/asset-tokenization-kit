import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import { getEquityDetail } from '@/lib/queries/equity/equity-detail';
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
  const equity = await getEquityDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: 'admin.equities.events',
  });

  return {
    title: t('events-page-title', {
      name: equity?.name,
    }),
    description: t('events-page-description', {
      name: equity?.name,
    }),
  };
}

export default async function EquityEventsPage({ params }: PageProps) {
  const { address } = await params;

  return <AssetEventsTable asset={address} />;
}
