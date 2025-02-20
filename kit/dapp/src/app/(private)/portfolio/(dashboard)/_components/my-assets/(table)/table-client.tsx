'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { getMyAssets } from '@/components/blocks/my-assets-table/data';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { columns } from './columns';

interface MyAssetsTableClientProps {
  queryKey: QueryKey;
  active?: boolean;
}

export function MyAssetsTableClient({ queryKey, active }: MyAssetsTableClientProps) {
  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: () => getMyAssets(active),
    refetchInterval: defaultRefetchInterval,
  });

  return (
    <DataTable
      columns={columns}
      data={data.balances}
      name="My Assets"
      pagination={{ enablePagination: false }}
      toolbar={{ enableToolbar: false }}
      initialSorting={[{ id: 'value', desc: true }]}
    />
  );
}
