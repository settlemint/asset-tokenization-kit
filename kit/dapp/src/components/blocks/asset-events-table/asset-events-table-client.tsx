'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { NormalizedEventsListItem } from './asset-events-fragments';
import { type EventsListVariables, getEventsList } from './asset-events-table-data';
import { columns, icons } from './table/columns';

interface AssetEventsTableClientProps {
  queryKey: QueryKey;
  variables?: EventsListVariables;
  disableToolbarAndPagination?: boolean;
}

export function AssetEventsTableClient({
  queryKey,
  variables,
  disableToolbarAndPagination = false,
}: AssetEventsTableClientProps) {
  const { data } = useSuspenseQuery<NormalizedEventsListItem[]>({
    queryKey,
    queryFn: () => getEventsList(variables),
  });

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
