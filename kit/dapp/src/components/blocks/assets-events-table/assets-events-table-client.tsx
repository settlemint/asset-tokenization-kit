'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { NormalizedEventsListItem } from './assets-events-fragments';
import { getEventsList } from './assets-events-table-data';
import { columns, icons } from './table/columns';

interface AssetEventsTableClientProps {
  queryKey: QueryKey;
  first?: number;
  asset?: string;
}

export function AssetEventsTableClient({ queryKey, first, asset }: AssetEventsTableClientProps) {
  const { data } = useSuspenseQuery<NormalizedEventsListItem[]>({
    queryKey,
    queryFn: () => getEventsList({ first, asset }),
    refetchInterval: 5000,
  });
  const disableToolbarAndPagination = typeof first === 'number';
  return (
    <DataTable
      columns={columns}
      data={data}
      icons={icons ?? {}}
      name={'Transactions'}
      toolbar={{ enableToolbar: !disableToolbarAndPagination }}
      pagination={{ enablePagination: !disableToolbarAndPagination }}
    />
  );
}
