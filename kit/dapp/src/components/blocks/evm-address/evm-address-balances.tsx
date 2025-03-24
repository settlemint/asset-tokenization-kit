"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import useSWR from "swr";
import type { Address } from "viem";
import { getAddress } from "viem";

interface EvmAddressBalancesProps {
  address: Address;
}

export function EvmAddressBalances({ address }: EvmAddressBalancesProps) {
  const { data: balances, isLoading } = useSWR(
    [`asset-balances`, address],
    async () => getAssetBalanceList({ wallet: getAddress(address) }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000, // 10 seconds
    }
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between py-1">
            <Skeleton className="h-5 w-20 bg-muted/50" />
            <Skeleton className="h-5 w-16 bg-muted/50" />
          </div>
        ))}
      </div>
    );
  }

  if (!balances || balances.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <p className="text-muted-foreground text-sm">No assets found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {balances.map((balance, index: number) => (
        <div key={index} className="flex items-center justify-between">
          <span className="font-medium text-sm">{balance.asset.symbol}</span>
          <span className="text-muted-foreground text-sm">{balance.value}</span>
        </div>
      ))}
    </div>
  );
}
