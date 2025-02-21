'use client';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { PageHeader } from '@/components/layout/page-header';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { useQueryKeys } from '@/hooks/use-query-keys';
import { assetConfig } from '@/lib/config/assets';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getCryptocurrencyTitle } from './data';

export function CryptocurrencyPageHeader({ id }: { id: Address }) {
  const { keys } = useQueryKeys();
  const { data: cryptocurrency } = useSuspenseQuery({
    queryKey: keys.asset.detail({ type: assetConfig.cryptocurrency.queryKey, address: id as Address }),
    queryFn: () => getCryptocurrencyTitle(id),
  });

  return (
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
    />
  );
}
