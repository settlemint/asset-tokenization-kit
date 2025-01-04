'use client';

import { columns, icons } from '@/app/(private)/admin/users/_components/user-table-columns';
import { DataTable } from '@/components/blocks/data-table/data-table';
import { admin } from '@/lib/auth/client';
import { useQuery } from '@tanstack/react-query';

export function UserTable() {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await admin.listUsers({
        query: {
          limit: Number.MAX_SAFE_INTEGER,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        },
      });

      if ('error' in response && response.error) {
        throw new Error(response.error.message ?? 'Failed to fetch users');
      }

      return response.data?.users ?? [];
    },
  });

  return <DataTable columns={columns} data={users ?? []} isLoading={isLoading} icons={icons} />;
}
