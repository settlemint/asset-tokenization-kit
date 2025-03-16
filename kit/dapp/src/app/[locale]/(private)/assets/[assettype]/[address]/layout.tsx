import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { getAssetBalanceList } from '@/lib/queries/asset-balance/asset-balance-list';
import { getAssetEventsList } from '@/lib/queries/asset-events/asset-events-list';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import type { AssetType } from '../types';
import { getDetailData } from './_components/detail-data';
import { DetailPageHeader } from './_components/page-header';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    locale: Locale;
    address: Address;
    assettype: AssetType;
  }>;
}

const tabs = async (params: LayoutProps['params']): Promise<TabItemProps[]> => {
  const { address, locale, assettype } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'private.assets.details',
  });

  const [details, balances, events] = await Promise.all([
    getDetailData({ address, assettype }),
    getAssetBalanceList({ wallet: address }),
    getAssetEventsList({ asset: address }),
  ]);

  return [
    {
      name: t('tabs.details'),
      href: `/assets/${assettype}/${address}`,
    },
    {
      name: t('tabs.holders'),
      href: `/assets/${assettype}/${address}/holders`,
      badge: details.totalHolders,
    },
    {
      name: t('tabs.events'),
      href: `/assets/${assettype}/${address}/events`,
      badge: events.length,
    },
    {
      name: t('tabs.permissions'),
      href: `/assets/${assettype}/${address}/permissions`,
    },
    {
      name: t('tabs.underlying-assets'),
      href: `/assets/${assettype}/${address}/underlying-assets`,
      badge: balances.length,
    },
  ];
};

export default async function AssetDetailLayout({
  children,
  params,
}: LayoutProps) {
  const tabItems = await tabs(params);
  const { address, assettype } = await params;

  return (
    <>
      <DetailPageHeader address={address} assettype={assettype} />
      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabItems} />
      </div>
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
  const detailData = await getDetailData({ assettype, address });

  return {
    title: t('page-title', {
      name: detailData?.name,
    }),
    description: t('page-description', {
      name: detailData?.name,
    }),
  };
}
