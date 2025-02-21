'use client';

import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { useStableCoinDetail } from '@/lib/queries/stablecoin/stablecoin-detail';
import type { Address } from 'viem';
import { ManageDropdown } from './manage-dropdown';

interface PageHeaderProps {
  address: Address;
}

export function StableCoinPageHeader({ address }: PageHeaderProps) {
  const { data: stableCoin } = useStableCoinDetail({ address });

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{stableCoin.name}</span>
          <span className="text-muted-foreground">({stableCoin.symbol})</span>
        </>
      }
      subtitle={
        <EvmAddress address={address} prettyNames={false}>
          <EvmAddressBalances address={address} />
        </EvmAddress>
      }
      pill={<ActivePill paused={stableCoin.paused} />}
      button={<ManageDropdown address={address} />}
    />
  );
}
