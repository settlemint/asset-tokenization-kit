'use server';
import { auth } from '@/lib/auth/auth';
import type { User } from '@/lib/auth/types';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';

export async function getUsers() {
  const headersToSet = await headers();
  return await unstable_cache(
    async () => {
      const { users } = await auth.api.listUsers({
        query: {
          limit: Number.MAX_SAFE_INTEGER,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        },
        headers: headersToSet,
      });
      return users as User[];
    },
    ['users'],
    {
      revalidate: 60,
      tags: ['users'],
    }
  )();
}

export async function getUser(id: string) {
  const headersToSet = await headers();
  return await unstable_cache(
    async () => {
      const { users } = await auth.api.listUsers({
        query: {
          limit: 1,
          filterField: 'id',
          filterValue: id,
        },
        headers: headersToSet,
      });
      const user = users.find((user) => user.id === id);
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      return user as User;
    },
    [`user-${id}`],
    {
      revalidate: 60,
      tags: [`user-${id}`],
    }
  )();
}
