'use client';

import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { TabNavigation } from '@/components/blocks/tab-navigation/tab-navigation';
import { EvmAddressBalances } from '@/components/evm-address-balances';
import { useParams } from 'next/navigation';
import type { PropsWithChildren } from 'react';
import { usePairDetails } from './_queries/pair-details';

export default function WalletTokenDetailLayout({ children }: PropsWithChildren) {
  const params = useParams();
  const address = params.address as string;

  const { data } = usePairDetails(address);

  return (
    <>
      <div className="mb-8 flex items-center justify-between space-y-2">
        <h2 className="font-bold text-3xl tracking-tight">
          <span>{data?.erc20DexPair?.name}</span>
          <div className="text-muted-foreground text-sm">
            <EvmAddress address={address} prefixLength={12} suffixLength={8}>
              <EvmAddressBalances address={address} />
            </EvmAddress>
          </div>
        </h2>
      </div>
      <div className="border-card border-b">
        <TabNavigation
          items={[
            { href: `/issuer/pairs/${address}/details`, name: 'Details' },
            {
              href: `/issuer/pairs/${address}/stakes`,
              name: 'Stakes',
              badge: data?.erc20DexPair?.stakes?.length,
            },
          ]}
        />
      </div>
      {children}
    </>
  );
}
