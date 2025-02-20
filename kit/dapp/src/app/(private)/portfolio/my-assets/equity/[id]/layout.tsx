import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { getFundTitle } from './_components/data';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const fund = await getFundTitle(id);

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

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const fund = await getFundTitle(id);

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
      />

      {children}
    </div>
  );
}
