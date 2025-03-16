import { getFundDetail } from '@/lib/queries/fund/fund-detail';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { FundPageHeader } from './_components/page-header';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    locale: Locale;
    address: Address;
  }>;
}

export async function generateMetadata({
  params,
}: LayoutProps): Promise<Metadata> {
  const { address, locale } = await params;
  const fund = await getFundDetail({ address });
  const t = await getTranslations({
    locale,
    namespace: 'admin.funds.details',
  });

  return {
    title: fund?.name,
    description: t('fund-details-description'),
  };
}

export default async function FundsDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address } = await params;

  return (
    <>
      <FundPageHeader address={address} />
      {children}
    </>
  );
}
