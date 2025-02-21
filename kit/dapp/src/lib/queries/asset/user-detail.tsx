import { Prefetch } from '@/components/blocks/prefetch/prefetch';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { type Address, getAddress } from 'viem';
import { UserFragment } from './user-fragment';

const UserDetail = hasuraGraphql(
  `
  query UserDetail($address: String!) {
    user(where: {wallet: {_eq: $address}}) {
      ...UserFragment
    }
  }
`,
  [UserFragment]
);

export interface UserDetailProps {
  address: Address;
}

async function getUserDetail({ address }: UserDetailProps) {
  if (!address) {
    return undefined;
  }
  const result = await hasuraClient.request(UserDetail, { address });
  if (result.user.length === 0) {
    return undefined;
  }
  return result.user[0];
}

const queryKey = ({ address }: UserDetailProps) => ['user', 'detail', getAddress(address)] as const;

export function useUserDetail({ address }: UserDetailProps) {
  const result = useSuspenseQuery({
    queryKey: queryKey({ address }),
    queryFn: () => getUserDetail({ address }),
  });

  return {
    ...result,
    queryKey: queryKey({ address }),
  };
}

export function PrefetchUserDetail({
  address,
  children,
  fallback,
}: PropsWithChildren<UserDetailProps & { fallback?: ReactNode }>) {
  return (
    <Prefetch
      fallback={fallback}
      queries={[
        {
          queryKey: queryKey({ address }),
          queryFn: () => getUserDetail({ address }),
        },
      ]}
    >
      {children}
    </Prefetch>
  );
}
