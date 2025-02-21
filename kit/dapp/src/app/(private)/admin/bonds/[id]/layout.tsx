import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { getBond } from './_components/data';
import { ManageDropdown } from './_components/manage-dropdown';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const bond = await getBond(id);

  if (!bond) {
    return {
      title: 'Bond not found',
    };
  }

  return {
    title: bond?.name,
    openGraph: {
      images: [
        {
          url: `/share/bonds/${id}/og`,
          width: 1280,
          height: 640,
          alt: bond?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/bonds/${id}/og`,
          width: 1280,
          height: 640,
          alt: bond?.name,
        },
      ],
    },
  };
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/bonds/${id}`,
  },
  {
    name: 'Holders',
    href: `/admin/bonds/${id}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/bonds/${id}/events`,
  },
  // {
  //   name: 'Permissions',
  //   href: `/admin/bonds/${id}/token-permissions`,
  // },
];

export default async function DetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const bond = await getBond(id);

  return (
    <div>
      <PageHeader
        title={
          <>
            <span className="mr-2">{bond?.name}</span>
            <span className="text-muted-foreground">({bond?.symbol})</span>
          </>
        }
        subtitle={
          <EvmAddress address={id as Address} prettyNames={false}>
            <EvmAddressBalances address={id as Address} />
          </EvmAddress>
        }
        pill={<ActivePill paused={bond?.paused ?? false} />}
        button={<ManageDropdown id={id as Address} bond={bond} />}
      />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
