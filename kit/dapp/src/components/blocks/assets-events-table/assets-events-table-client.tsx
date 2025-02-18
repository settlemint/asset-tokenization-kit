'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import type { DataTablePaginationOptions } from '@/components/blocks/data-table/data-table-pagination';
import type { DataTableToolbarOptions } from '@/components/blocks/data-table/data-table-toolbar';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { NormalizedEventsListItem } from './assets-events-fragments';
import { getEventsList } from './assets-events-table-data';
import { columns, icons } from './table/columns';

interface AssetEventsTableClientProps {
  queryKey: QueryKey;
  first?: number;
  toolbar?: DataTableToolbarOptions;
  pagination?: DataTablePaginationOptions;
  asset?: string;
}

export function AssetEventsTableClient({ queryKey, first, toolbar, pagination, asset }: AssetEventsTableClientProps) {
  const { data } = useSuspenseQuery<NormalizedEventsListItem[]>({
    queryKey,
    queryFn: () => getEventsList({ first, asset }),
    refetchInterval: 5000,
  });

  return (
    <DataTable
      columns={columns}
      data={data}
      icons={icons ?? {}}
      name={'Transactions'}
      toolbar={toolbar}
      pagination={pagination}
    />
  );
}
