'use client';

import { formatNumber } from '@/lib/number';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';

const EvmAddressBalancesQuery = theGraphGraphqlStarterkits(`
  query AddressBalances($account: String!, $first: Int, $skip: Int) {
    assetBalances(where: {account: $account}, first: $first, skip: $skip) {
      id
      value
      asset {
        name
        symbol
      }
    }
  }
`);

/**
 * Renders a display of token balances.
 * @param props - The component props.
 * @param props.balances - An array of token balances to display.
 * @returns The rendered BalanceDisplay component.
 */
export function EvmAddressBalances({ address }: { address: string }) {
  const { data: balances } = useSuspenseQuery({
    queryKey: ['evm-address-balances', address],
    queryFn: () => {
      return fetchAllTheGraphPages(async (first, skip) => {
        const result = await theGraphClientStarterkits.request(EvmAddressBalancesQuery, {
          account: address,
          first,
          skip,
        });
        return result.assetBalances;
      });
    },
    refetchInterval: 10000,
    staleTime: 5000,
  });

  if (balances.length === 0) {
    return (
      <div className="mt-2">
        <p className="text-sm">This address has no token balances.</p>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <dl className="text-sm">
        {balances.map((balance) => (
          <div key={balance.id} className="flex items-center justify-between">
            <dt className="text-muted-foreground">{balance.asset.name}:</dt>
            <dd>{formatNumber(balance.value, { token: balance.asset.symbol })}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
