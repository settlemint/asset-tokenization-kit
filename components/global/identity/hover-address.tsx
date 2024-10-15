"use client";

import { ExtendedAvatar } from "@/components/global/identity/extended-avatar";
import { useAvatar } from "@/components/hooks/use-avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Link, formatToken } from "@/lib/i18n";
import { theGraphFallbackClient, theGraphFallbackGraphql } from "@/lib/settlemint/clientside/the-graph-fallback";
import { extendedHex, shortHex } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

const AddressBalances = theGraphFallbackGraphql(`
query AddressBalances($account: String!) {
  erc20Balances(where: {account: $account}) {
    value
    contract {
      name
      symbol
    }
  }
}
  `);

export function AddressHover({ address }: { address: string }) {
  const avatar = useAvatar({ address: address });

  const {
    data: balances,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["addressbalances", address],
    queryFn: async () => {
      const response = await theGraphFallbackClient.request(AddressBalances, {
        account: address,
      });
      if (!response?.erc20Balances) {
        return [];
      }
      return response.erc20Balances;
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  const displayName = useMemo(() => avatar?.ensName ?? shortHex(address), [avatar?.ensName, address]);

  return (
    <HoverCard>
      <HoverCardTrigger>
        <div className="flex items-center space-x-2">
          <ExtendedAvatar address={address} variant="small" />
          <span>{displayName}</span>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex items-start">
          <h4 className="text-sm font-semibold grid grid-cols-[auto,1fr] gap-x-2 items-start">
            <ExtendedAvatar address={address} className="row-span-2" />
            <div className="flex flex-col">
              <span>{avatar?.ensName ?? extendedHex(address)}</span>
              <Link
                prefetch={false}
                href={`https://amoy.polygonscan.com/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline truncate text-primary text-xs"
              >
                View on the explorer
              </Link>
            </div>
          </h4>
        </div>
        <div className="mt-2">
          {isLoading && <p>Loading balances...</p>}
          {isError && <p>Error loading balances</p>}
          {balances && <BalanceDisplay balances={balances} />}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

function BalanceDisplay({
  balances,
}: {
  balances: {
    value: string;
    contract: {
      name: string | null;
      symbol: string | null;
    };
  }[];
}) {
  return (
    <dl className="text-sm">
      {balances.map((balance) => (
        <div key={balance.contract.symbol} className="flex items-center justify-between">
          <dt className="text-muted-foreground">{balance.contract.name}:</dt>
          <dd>
            {formatToken(Number.parseFloat(balance.value), 2)} {balance.contract.symbol}
          </dd>
        </div>
      ))}
    </dl>
  );
}
