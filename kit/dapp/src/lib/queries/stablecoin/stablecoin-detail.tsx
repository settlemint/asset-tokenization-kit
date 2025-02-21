import { Prefetch } from '@/components/blocks/prefetch/prefetch';
import { assetConfig } from '@/lib/config/assets';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { theGraphClientStarterkits, theGraphGraphqlStarterkits } from '@/lib/settlemint/the-graph';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { type Address, getAddress } from 'viem';
import { OffchainStableCoinFragment, StableCoinFragment } from './stablecoin-fragment';

const StableCoinDetail = theGraphGraphqlStarterkits(
  `
  query StableCoinDetail($id: ID!) {
    stableCoin(id: $id) {
      ...StableCoinFragment
    }
  }
`,
  [StableCoinFragment]
);

const OffchainStableCoinDetail = hasuraGraphql(
  `
  query OffchainStableCoinDetail($id: String!) {
    asset(where: {id: {_eq: $id}}, limit: 1) {
      ...OffchainStableCoinFragment
    }
  }
`,
  [OffchainStableCoinFragment]
);

export interface StableCoinDetailProps {
  address: Address;
}

export async function getStableCoinDetail({ address }: StableCoinDetailProps) {
  const [data, dbStableCoin] = await Promise.all([
    theGraphClientStarterkits.request(StableCoinDetail, { id: address }),
    hasuraClient.request(OffchainStableCoinDetail, { id: getAddress(address) }),
  ]);

  if (!data.stableCoin) {
    throw new Error('Stablecoin not found');
  }

  return {
    ...data.stableCoin,
    ...dbStableCoin.asset[0],
  };
}

export const queryKey = ({ address }: StableCoinDetailProps) =>
  ['asset', 'detail', assetConfig.stablecoin.queryKey, getAddress(address)] as const;

export function useStableCoinDetail({ address }: StableCoinDetailProps) {
  const result = useSuspenseQuery({
    queryKey: queryKey({ address }),
    queryFn: () => getStableCoinDetail({ address }),
  });

  return {
    ...result,
    config: assetConfig.stablecoin,
    queryKey: queryKey({ address }),
  };
}

export function PrefetchStableCoinDetail({
  address,
  children,
  fallback,
}: PropsWithChildren<StableCoinDetailProps & { fallback?: ReactNode }>) {
  return (
    <Prefetch
      fallback={fallback}
      queries={[
        {
          queryKey: queryKey({ address }),
          queryFn: () => getStableCoinDetail({ address }),
        },
      ]}
    >
      {children}
    </Prefetch>
  );
}
