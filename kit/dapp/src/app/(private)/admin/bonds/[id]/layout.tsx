import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { metadata as baseMetadata } from '@/lib/config/metadata';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import { getBondTitle } from './_components/data';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const bond = await getBondTitle(id);

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
          url: `/admin/bonds/${id}/og`,
          width: 1280,
          height: 640,
          alt: bond?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/admin/bonds/${id}/og`,
          width: 1280,
          height: 640,
          alt: bond?.name,
        },
      ],
    },
  };
}

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'View and manage your tokenized asset portfolio.',
  openGraph: {
    ...baseMetadata.openGraph,
    title: 'Portfolio',
    description: 'View and manage your tokenized asset portfolio.',
    images: [
      {
        // TODO: Replace with actual user address when authentication is implemented
        url: '/api/og/asset?address=0x0000000000000000000000000000000000000000',
        width: 1200,
        height: 630,
        alt: 'Portfolio Overview',
      },
    ],
  },
  twitter: {
    ...baseMetadata.twitter,
    title: 'Portfolio',
    description: 'View and manage your tokenized asset portfolio.',
    images: [
      {
        // TODO: Replace with actual user address when authentication is implemented
        url: '/api/og/asset?address=0x0000000000000000000000000000000000000000',
        width: 1200,
        height: 630,
        alt: 'Portfolio Overview',
      },
    ],
  },
};

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
  {
    name: 'Block list',
    href: `/admin/bonds/${id}/blocklist`,
  },
  {
    name: 'Token permissions',
    href: `/admin/bonds/${id}/token-permissions`,
  },
];

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const bond = await getBondTitle(id);

  return (
    <div>
      <h1 className="flex items-center font-bold text-2xl">
        <span className="mr-2">{bond?.name}</span>
        <span className="text-muted-foreground">({bond?.symbol})</span>
      </h1>
      <div className="text-muted-foreground text-sm">
        <EvmAddress address={id}>
          <EvmAddressBalances address={id} />
        </EvmAddress>
      </div>

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
