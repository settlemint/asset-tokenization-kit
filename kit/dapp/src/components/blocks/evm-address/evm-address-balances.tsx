"use client";

import { Skeleton } from "@/components/ui/skeleton";
import useSWR from "swr";
import type { Address } from "viem";

interface EvmAddressBalancesProps {
  address: Address;
}

// Define balance type
interface AssetBalance {
  asset: {
    symbol: string;
    // Add other properties from asset if needed
  };
  value: number; // Changed from string to number
  // Add other required properties
  account?: {
    id: `0x${string}`;
    lastActivity: Date;
  };
  lastActivity?: Date;
  blocked?: boolean;
  frozen?: number;
}

export function EvmAddressBalances({ address }: EvmAddressBalancesProps) {
  const { data: balances, isLoading } = useSWR(
    [`asset-balances-${address}`],
    async () => {
      return [];
    },
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
      {balances.map((balance: AssetBalance, index: number) => (
        <div key={index} className="flex items-center justify-between">
          <span className="font-medium text-sm">{balance.asset.symbol}</span>
          <span className="text-muted-foreground text-sm">{balance.value}</span>
        </div>
      ))}
    </div>
  );
}
