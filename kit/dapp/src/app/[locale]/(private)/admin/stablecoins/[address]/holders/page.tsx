import { getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { HoldersTable } from './_components/holders-table';

interface PageProps {
  params: Promise<{ locale: string; address: Address }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; address: Address }>;
}): Promise<Metadata> {
  const { address, locale } = await params;
  const stableCoin = await getStableCoinDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: 'admin.stablecoins.holders',
  });

  return {
    title: t('holders-page-title', {
      name: stableCoin?.name,
    }),
    description: t('holders-page-description', {
      name: stableCoin?.name,
    }),
  };
}

export default async function StablecoinHoldersPage({ params }: PageProps) {
  const { address } = await params;
  return <HoldersTable address={address} />;
}
