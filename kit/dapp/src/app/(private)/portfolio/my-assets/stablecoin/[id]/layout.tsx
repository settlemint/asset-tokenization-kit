import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { getStableCoin } from './_components/data';
import { ManageDropdown } from './_components/manage-dropdown';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const stableCoin = await getStableCoin(id);

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

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const stableCoin = await getStableCoin(id);

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

      {children}
    </div>
  );
}
