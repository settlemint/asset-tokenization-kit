import { Prefetch } from '@/components/blocks/prefetch/prefetch';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { fetchAllTheGraphPages } from '@/lib/utils/pagination';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { type Address, getAddress } from 'viem';
import { BalanceFragment } from './balance-fragment';

const BalanceList = theGraphGraphqlStarterkits(
  `
  query Balances($address: String!, $first: Int, $skip: Int) {
    assetBalances(where: {asset: $address}, first: $first, skip: $skip) {
      ...BalanceFragment
    }
  }
`,
  [BalanceFragment]
);

export interface BalanceListProps {
  address: Address;
}

export function getBalanceList({ address }: BalanceListProps) {
  return fetchAllTheGraphPages(async (first, skip) => {
    const result = await theGraphClientStarterkits.request(BalanceList, { address, first, skip });
    return result.assetBalances;
  });
}

const queryKey = ({ address }: BalanceListProps) => ['asset', 'balance', getAddress(address)] as const;

export function useBalanceList({ address }: BalanceListProps) {
  const result = useSuspenseQuery({
    queryKey: queryKey({ address }),
    queryFn: () => getBalanceList({ address }),
  });

  return {
    ...result,
    queryKey: queryKey({ address }),
  };
}

export function PrefetchBalanceList({
  address,
  children,
  fallback,
}: PropsWithChildren<BalanceListProps & { fallback?: ReactNode }>) {
  return (
    <Prefetch
      fallback={fallback}
      queries={[
        {
          queryKey: queryKey({ address }),
          queryFn: () => getBalanceList({ address }),
        },
      ]}
    >
      {children}
    </Prefetch>
  );
}
