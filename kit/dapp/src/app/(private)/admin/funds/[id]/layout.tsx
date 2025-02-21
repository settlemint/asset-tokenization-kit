import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeader } from '@/components/layout/page-header';
import {} from '@/components/ui/dropdown-menu';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { getFund } from './_components/data';
import { ManageDropdown } from './_components/manage-dropdown';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const fund = await getFund(id);

  if (!fund) {
    return {
      title: 'Fund not found',
    };
  }

  return {
    title: fund?.name,
    openGraph: {
      images: [
        {
          url: `/share/funds/${id}/og`,
          width: 1280,
          height: 640,
          alt: fund?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/funds/${id}/og`,
          width: 1280,
          height: 640,
          alt: fund?.name,
        },
      ],
    },
  };
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/funds/${id}`,
  },
  {
    name: 'Holders',
    href: `/admin/funds/${id}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/funds/${id}/events`,
  },
  // {
  //   name: 'Permissions',
  //   href: `/admin/funds/${id}/token-permissions`,
  // },
];

export default async function DetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const fund = await getFund(id);

  return (
    <div>
      <PageHeader
        title={
          <>
            <span className="mr-2">{fund?.name}</span>
            <span className="text-muted-foreground">({fund?.symbol})</span>
          </>
        }
        subtitle={
          <EvmAddress address={id as Address} prettyNames={false}>
            <EvmAddressBalances address={id as Address} />
          </EvmAddress>
        }
        pill={<ActivePill paused={fund?.paused ?? false} />}
        button={<ManageDropdown id={id as Address} fund={fund} />}
      />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
