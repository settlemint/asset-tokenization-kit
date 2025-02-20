import { ManageDropdown } from '@/app/(private)/admin/stablecoins/[id]/_components/manage-dropdown';
import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { getStableCoinTitle } from './_components/data';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const stableCoin = await getStableCoinTitle(id);

  if (!stableCoin) {
    return {
      title: 'Stablecoin not found',
    };
  }

  return {
    title: stableCoin?.name,
    openGraph: {
      images: [
        {
          url: `/share/stablecoins/${id}/og`,
          width: 1280,
          height: 640,
          alt: stableCoin?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/stablecoins/${id}/og`,
          width: 1280,
          height: 640,
          alt: stableCoin?.name,
        },
      ],
    },
  };
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/stablecoins/${id}`,
  },
  {
    name: 'Holders',
    href: `/admin/stablecoins/${id}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/stablecoins/${id}/events`,
  },
  // {
  //   name: 'Block list',
  //   href: `/admin/stablecoins/${id}/blocklist`,
  // },
  {
    name: 'Token permissions',
    href: `/admin/stablecoins/${id}/token-permissions`,
  },
];

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const stableCoin = await getStableCoinTitle(id);

  return (
    <div>
      <PageHeader
        title={
          <>
            <span className="mr-2">{stableCoin?.name}</span>
            <span className="text-muted-foreground">({stableCoin?.symbol})</span>
          </>
        }
        subtitle={
          <EvmAddress address={id as Address} prettyNames={false}>
            <EvmAddressBalances address={id as Address} />
          </EvmAddress>
        }
        pill={<ActivePill paused={stableCoin?.paused ?? false} />}
        button={<ManageDropdown id={id as Address} stableCoin={stableCoin} />}
      />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
