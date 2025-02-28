import { AssetEventsTable } from '@/components/blocks/asset-events-table/asset-events-table';
import { getBondDetail } from '@/lib/queries/bond/bond-detail';
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
  const bond = await getBondDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: 'admin.bonds.events',
  });

  return {
    title: t('events-page-title', {
      name: bond?.name,
    }),
    description: t('events-page-description', {
      name: bond?.name,
    }),
  };
}

export default async function BondEventsPage({ params }: PageProps) {
  const { address } = await params;

  return <AssetEventsTable asset={address} />;
}
