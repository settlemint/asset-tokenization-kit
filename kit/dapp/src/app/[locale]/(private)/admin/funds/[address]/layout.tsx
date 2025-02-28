import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { getFundDetail } from '@/lib/queries/fund/fund-detail';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { FundPageHeader } from './_components/page-header';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    locale: string;
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

const tabs = async (
  address: string,
  locale: string
): Promise<TabItemProps[]> => {
  const t = await getTranslations({
    locale,
    namespace: 'admin.funds.tabs',
  });

  return [
    {
      name: t('details'),
      href: `/admin/funds/${address}`,
    },
    {
      name: t('holders'),
      href: `/admin/funds/${address}/holders`,
    },
    {
      name: t('events'),
      href: `/admin/funds/${address}/events`,
    },
    {
      name: t('permissions'),
      href: `/admin/funds/${address}/permissions`,
    },
  ];
};

export default async function FundsDetailLayout({
  children,
  params,
}: LayoutProps) {
  const { address, locale } = await params;
  const tabItems = await tabs(address, locale);

  return (
    <>
      <FundPageHeader address={address} />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabItems} />
      </div>
      {children}
    </>
  );
}
