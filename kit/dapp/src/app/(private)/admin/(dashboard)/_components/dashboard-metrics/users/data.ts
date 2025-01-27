'use server';

import { hasuraClient, hasuraGraphql } from '@/lib/settlemint/hasura';
import { unstable_cache } from 'next/cache';

const UsersQuery = hasuraGraphql(`
  query Users {
    user_aggregate {
      nodes {
        created_at
      }
    }
  }
`);

export type UsersData = {
  totalUsers: number;
  usersInLast24Hours: number;
};

export async function getUsersData(): Promise<UsersData> {
  const data = await unstable_cache(
    async () => {
      return await hasuraClient.request(UsersQuery);
    },
    ['users'],
    {
      revalidate: 60,
      tags: ['users'],
    }
  )();

  return {
    totalUsers: data.user_aggregate.nodes.length,
    usersInLast24Hours: data.user_aggregate.nodes.filter((user) => {
      return new Date(user.created_at as string).getTime() > Date.now() - 24 * 60 * 60 * 1000;
    }).length,
  };
}
