'use client';

import { useQueryKeys } from '@/hooks/use-query-keys';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getAddress } from 'viem';

interface EvmAddressBalancesProps {
  address: Address;
}

interface Balance {
  value: string;
  asset: {
    symbol: string;
    decimals: number;
  };
}

const GetBalances = theGraphGraphqlStarterkits(`
  query GetBalances($address: String!) {
    assetBalances(where: { account: $address }) {
      value
      asset {
        symbol
        decimals
      }
    }
  }
`);

export function EvmAddressBalances({ address }: EvmAddressBalancesProps) {
  const { keys } = useQueryKeys();
  const { data } = useSuspenseQuery<{ assetBalances: Balance[] }>({
    queryKey: keys.user.balances(address),
    queryFn: async () => {
      const result = await theGraphClientStarterkits.request(GetBalances, {
        address: getAddress(address),
      });
      return result;
    },
  });

  if (!data?.assetBalances || data.assetBalances.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-1">
      {data.assetBalances.map((balance) => (
        <div key={balance.asset.symbol} className="flex items-center justify-between">
          <span className="text-sm font-medium">{balance.asset.symbol}</span>
          <span className="text-sm text-muted-foreground">
            {(Number(balance.value) / 10 ** balance.asset.decimals).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}
