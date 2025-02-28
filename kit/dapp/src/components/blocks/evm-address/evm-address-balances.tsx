'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { getAssetBalanceList } from '@/lib/queries/asset-balance/asset-balance-list';
import { useEffect, useState } from 'react';
import type { Address } from 'viem';
import { getAddress } from 'viem';

interface EvmAddressBalancesProps {
  address: Address;
}

export function EvmAddressBalances({ address }: EvmAddressBalancesProps) {
  const [balances, setBalances] =
    useState<Awaited<ReturnType<typeof getAssetBalanceList>>>();
  const [isLoading, setIsLoading] = useState(true);

  // Effect to fetch user and asset data
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const balances = await getAssetBalanceList({
          address: getAddress(address),
        });
        setBalances(balances);
      } finally {
        setIsLoading(false);
      }
    }

    // Call the fetch function
    void fetchData();
  }, [address]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between py-1">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
      </div>
    );
  }

  if (!balances || balances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <p className="text-sm text-muted-foreground">No assets found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {balances.map((balance, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm font-medium">{balance.asset.symbol}</span>
          <span className="text-sm text-muted-foreground">{balance.value}</span>
        </div>
      ))}
    </div>
  );
}
