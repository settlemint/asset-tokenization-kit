'use server';
import { auth } from '@/lib/auth/auth';
import { unstable_cache } from 'next/cache';
import { headers } from 'next/headers';

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
      const user = users.find((user) => user.id === id)!;

      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }
      return user;
    },
    [`user-${id}`],
    {
      revalidate: 60,
      tags: [`user-${id}`],
    }
  )();
}
