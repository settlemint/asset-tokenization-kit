import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
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

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const bond = await getBondTitle(id);

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
      />

      {children}
    </div>
  );
}
