'use client';
import { ActivePill } from '@/components/blocks/active-pill/active-pill';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { useQueryKeys } from '@/hooks/use-query-keys';
import { assetConfig } from '@/lib/config/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getEquityTitle } from './data';

export function EquityPageHeader({ id }: { id: Address }) {
  const { keys } = useQueryKeys();
  const { data: equity } = useSuspenseQuery({
    queryKey: keys.asset.detail({ type: assetConfig.equity.queryKey, address: id as Address }),
    queryFn: () => getEquityTitle(id),
  });

  return (
    <PageHeader
      title={
        <>
          <span className="mr-2">{equity?.name}</span>
          <span className="text-muted-foreground">({equity?.symbol})</span>
        </>
      }
      subtitle={
        <EvmAddress address={id as Address} prettyNames={false}>
          <EvmAddressBalances address={id as Address} />
        </EvmAddress>
      }
      pill={<ActivePill paused={equity?.paused ?? false} />}
    />
  );
}
