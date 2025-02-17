'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { DataTablePaginationOptions } from '@/components/blocks/data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '@/components/blocks/data-table/data-table-toolbar';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { columns, icons } from './columns';
import type { Holder } from './data';
import { getHolders } from './data';

interface HoldersTableClientProps {
  queryKey: QueryKey;
  first?: number;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
  asset: string;
}

export function HoldersTableClient({ queryKey, toolbar, pagination, asset }: HoldersTableClientProps) {
  const { data } = useSuspenseQuery<Holder[]>({
    queryKey,
    queryFn: () => getHolders(asset),
    refetchInterval: 5000,
  });

  return (
    <DataTable
      columns={columns(asset as Address)}
      data={data}
      icons={icons}
      name={'Holders'}
      toolbar={toolbar}
      pagination={pagination}
    />
  );
}
