'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { defaultRefetchInterval } from '@/lib/react-query';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import { columns } from './columns';
import { getMyAssets } from './data';

interface MyAssetsTableClientProps {
  queryKey: QueryKey;
  first?: number;
  asset?: string;
  disableToolbarAndPagination?: boolean;
}

export function MyAssetsTableClient({
  queryKey,
  first,
  asset,
  disableToolbarAndPagination = false,
}: MyAssetsTableClientProps) {
  const { data } = useSuspenseQuery({
    queryKey,
    queryFn: getMyAssets,
    refetchInterval: defaultRefetchInterval,
  });

  return (
    <DataTable
      columns={columns}
      data={data.balances}
      name="My Assets"
      toolbar={{ enableToolbar: !disableToolbarAndPagination }}
      pagination={{ enablePagination: !disableToolbarAndPagination }}
    />
  );
}
