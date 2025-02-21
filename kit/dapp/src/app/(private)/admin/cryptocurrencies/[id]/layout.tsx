import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import type { TabItemProps } from '@/components/blocks/tab-navigation/tab-item';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { getCryptocurrency } from './_components/data';
import { ManageDropdown } from './_components/manage-dropdown';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const cryptocurrency = await getCryptocurrency(id);

  if (!cryptocurrency) {
    return {
      title: 'Cryptocurrency not found',
    };
  }

  return {
    title: cryptocurrency?.name,
    openGraph: {
      images: [
        {
          url: `/share/cryptocurrencies/${id}/og`,
          width: 1280,
          height: 640,
          alt: cryptocurrency?.name,
        },
      ],
    },
    twitter: {
      images: [
        {
          url: `/share/cryptocurrencies/${id}/og`,
          width: 1280,
          height: 640,
          alt: cryptocurrency?.name,
        },
      ],
    },
  };
}

const tabs = (id: string): TabItemProps[] => [
  {
    name: 'Details',
    href: `/admin/cryptocurrencies/${id}`,
  },
  {
    name: 'Holders',
    href: `/admin/cryptocurrencies/${id}/holders`,
  },
  {
    name: 'Events',
    href: `/admin/cryptocurrencies/${id}/events`,
  },
  // {
  //   name: 'Permissions',
  //   href: `/admin/cryptocurrencies/${id}/token-permissions`,
  // },
];

export default async function DetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const cryptocurrency = await getCryptocurrency(id);

  return (
    <div>
      <PageHeader
        title={
          <>
            <span className="mr-2">{cryptocurrency?.name}</span>
            <span className="text-muted-foreground">({cryptocurrency?.symbol})</span>
          </>
        }
        subtitle={
          <EvmAddress address={id as Address} prettyNames={false}>
            <EvmAddressBalances address={id as Address} />
          </EvmAddress>
        }
        button={<ManageDropdown id={id as Address} cryptocurrency={cryptocurrency} />}
      />

      <div className="relative mt-4 space-y-2">
        <TabNavigation items={tabs(id)} />
      </div>
      {children}
    </div>
  );
}
