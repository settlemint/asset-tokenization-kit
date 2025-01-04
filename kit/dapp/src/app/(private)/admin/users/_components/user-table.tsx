import { columns, icons } from '@/app/(private)/admin/users/_components/user-table-columns';
import { DataTable } from '@/components/blocks/data-table/data-table';
import { auth } from '@/lib/auth/auth';
import type { Session } from '@/lib/auth/types';
import { headers } from 'next/headers';

export async function UserTable() {
  const { users } = await auth.api.listUsers({
    query: {
      limit: Number.MAX_SAFE_INTEGER,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    },
    headers: await headers(),
  });

  return <DataTable columns={columns} data={users as Session['user'][]} icons={icons} />;
}
