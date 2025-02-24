import { getBalanceForAsset } from '@/components/blocks/asset-balance/data';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { getAuthenticatedUser } from '@/lib/auth/auth';
import type { Metadata } from 'next';
import type { PropsWithChildren } from 'react';
import type { Address } from 'viem';
import { getCryptocurrencyTitle } from './_components/data';
import { ManageDropdown } from './_components/manage-dropdown';

interface LayoutProps extends PropsWithChildren {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: LayoutProps): Promise<Metadata> {
  const { id } = await params;
  const cryptocurrency = await getCryptocurrencyTitle(id);

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

export default async function FundsDetailLayout({ children, params }: LayoutProps) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  const cryptocurrency = await getCryptocurrencyTitle(id);
  const balance = await getBalanceForAsset(user.wallet as Address, id as Address);

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
        button={<ManageDropdown id={id as Address} cryptocurrency={cryptocurrency} balance={balance} />}
      />

      {children}
    </div>
  );
}
