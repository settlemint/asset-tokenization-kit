import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PrefetchStableCoinDetail, getStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    address: Address;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { address } = await params;
  const stableCoin = await getStableCoinDetail({ address });
  return {
    title: stableCoin?.name,
  };
}

const tabs = (address: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/stablecoins/${address}`,
  },
  {
    name: 'Holders',
    href: `/admin/stablecoins/${address}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/stablecoins/${address}/events`,
  },
  {
    name: 'Permissions',
    href: `/admin/stablecoins/${address}/token-permissions`,
  },
];

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { address } = await params;

  return (
    <PrefetchStableCoinDetail address={address}>
      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(address)} />
      </div>
      {children}
    </PrefetchStableCoinDetail>
  );
}
