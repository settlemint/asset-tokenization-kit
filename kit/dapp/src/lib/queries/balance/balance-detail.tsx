import { Prefetch } from '@/components/blocks/prefetch/prefetch';
import { BalanceFragment } from '@/lib/queries/balance/balance-fragment';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { type Address, getAddress } from 'viem';

const BalanceDetail = theGraphGraphqlStarterkits(
  `
  query Balance($address: String!, $account: String!) {
    assetBalances(where: {asset: $address, account: $account}) {
      ...BalanceFragment
    }
  }
`,
  [BalanceFragment]
);

export interface BalanceDetailProps {
  address: Address;
  account?: Address;
}

async function getBalanceDetail({ address, account }: BalanceDetailProps) {
  if (!account) {
    return undefined;
  }
  const result = await theGraphClientStarterkits.request(BalanceDetail, { address, account });
  if (result.assetBalances.length === 0) {
    return undefined;
  }
  return result.assetBalances[0];
}

const queryKey = ({ address, account }: BalanceDetailProps) =>
  ['asset', 'balance', getAddress(address), ...(account ? [getAddress(account)] : [])] as const;

export function useBalanceDetail({ address, account }: BalanceDetailProps) {
  const result = useSuspenseQuery({
    queryKey: queryKey({ address, account }),
    queryFn: () => getBalanceDetail({ address, account }),
  });

  return {
    ...result,
    queryKey: queryKey({ address, account }),
  };
}

export function PrefetchBalanceDetail({
  address,
  account,
  children,
  fallback,
}: PropsWithChildren<BalanceDetailProps & { fallback?: ReactNode }>) {
  return (
    <Prefetch
      fallback={fallback}
      queries={[
        {
          queryKey: queryKey({ address, account }),
          queryFn: () => getBalanceDetail({ address, account }),
        },
      ]}
    >
      {children}
    </Prefetch>
  );
}
