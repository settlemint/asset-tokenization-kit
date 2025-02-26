import { getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { Address } from 'viem';
import { PermissionsTable } from './_components/permissions-table';

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
    namespace: 'admin.stablecoins.permissions',
  });

  return {
    title: t('permissions-page-title', {
      name: stableCoin?.name,
    }),
    description: t('permissions-page-description', {
      name: stableCoin?.name,
    }),
  };
}

export default async function StablecoinTokenPermissionsPage({
  params,
}: PageProps) {
  const { address } = await params;

  return <PermissionsTable address={address} />;
}
