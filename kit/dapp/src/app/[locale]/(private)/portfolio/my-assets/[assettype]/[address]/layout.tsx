import { DetailPageHeader } from '@/app/[locale]/(private)/assets/[assettype]/[address]/_components/page-header';
import { getAssetDetail } from '@/lib/queries/asset-detail';
import type { AssetType } from '@/lib/utils/zod';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    locale: Locale;
    address: Address;
    assettype: AssetType;
  }>;
}

export default async function BondsDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, assettype } = await params;

  return (
    <>
      <DetailPageHeader address={address} assettype={assettype} />
      {children}
    </>
  );
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { address, assettype, locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'private.assets.details',
  });
  const detailData = await getAssetDetail({ assettype, address });

  return {
    title: t('page-title', {
      name: detailData?.name,
    }),
    description: t('page-description', {
      name: detailData?.name,
    }),
  };
}
