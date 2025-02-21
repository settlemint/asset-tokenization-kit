import { Prefetch } from '@/components/blocks/prefetch/prefetch';
import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { useSuspenseQuery } from '@tanstack/react-query';
import type { PropsWithChildren, ReactNode } from 'react';
import { type Address, getAddress } from 'viem';
import { UserFragment } from './user-fragment';

const UserSearch = hasuraGraphql(
  `
  query UserSearch($address: String!) {
    user(
      where: {
        _or: [
          { name: { _ilike: $address } },
          { wallet: { _ilike: $address } },
          { email: { _like: $address } }
        ]
      },
      limit: 10
    ) {
      ...UserFragment
    }
  }
`,
  [UserFragment]
);

export interface UserSearchProps {
  address: Address;
}

async function getUserSearch({ address }: UserSearchProps) {
  if (!address) {
    return undefined;
  }
  const result = await hasuraClient.request(UserSearch, { address: `%${address}%` });
  if (result.user.length === 0) {
    return undefined;
  }
  return result.user;
}

const queryKey = ({ address }: UserSearchProps) => ['user', 'search', getAddress(address)] as const;

export function useUserSearch({ address }: UserSearchProps) {
  const result = useSuspenseQuery({
    queryKey: queryKey({ address }),
    queryFn: () => getUserSearch({ address }),
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
}: PropsWithChildren<UserSearchProps & { fallback?: ReactNode }>) {
  return (
    <Prefetch
      fallback={fallback}
      queries={[
        {
          queryKey: queryKey({ address }),
          queryFn: () => getUserSearch({ address }),
        },
      ]}
    >
      {children}
    </Prefetch>
  );
}
