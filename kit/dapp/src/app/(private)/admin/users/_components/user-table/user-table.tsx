import { DataTable } from '@/components/blocks/data-table/data-table';
import { auth } from '@/lib/auth/auth';
import type { User } from '@/lib/auth/types';
import { headers } from 'next/headers';
import { columns } from './user-table-columns';
import { icons } from './user-table-icons';

export async function UserTable() {
  const { users } = await auth.api.listUsers({
    query: {
      limit: Number.MAX_SAFE_INTEGER,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    },
    headers: await headers(),
  });

  return <DataTable columns={columns} data={users as User[]} icons={icons} />;
}
