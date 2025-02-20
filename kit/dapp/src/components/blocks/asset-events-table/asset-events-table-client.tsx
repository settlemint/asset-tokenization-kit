'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { type QueryKey, useSuspenseQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import type { NormalizedEventsListItem } from './asset-events-fragments';
import { getEventsList } from './asset-events-table-data';
import { columns, icons } from './table/columns';

interface AssetEventsTableClientProps {
  queryKey: QueryKey;
  first?: number;
  asset?: Address;
  disableToolbarAndPagination?: boolean;
}

export function AssetEventsTableClient({
  queryKey,
  first,
  asset,
  disableToolbarAndPagination = false,
}: AssetEventsTableClientProps) {
  const { data } = useSuspenseQuery<NormalizedEventsListItem[]>({
    queryKey,
    queryFn: () =>
      getEventsList({
        first,
        asset,
      }),
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
