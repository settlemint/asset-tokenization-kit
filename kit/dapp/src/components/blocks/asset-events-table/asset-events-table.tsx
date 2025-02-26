'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { useAssetEventsList } from '@/lib/queries/asset-events/asset-events-list';
import type { Address } from 'viem';
import { columns, icons } from './table/columns';

interface AssetEventsTableProps {
  asset?: Address;
  sender?: Address;
  disableToolbarAndPagination?: boolean;
  limit?: number;
}

export function AssetEventsTable({
  asset,
  sender,
  disableToolbarAndPagination = false,
  limit,
}: AssetEventsTableProps) {
  const { data: events } = useAssetEventsList({ asset, sender, limit });

  return (
    <DataTable
      columns={columns}
      data={events}
      icons={icons ?? {}}
      name={'Events'}
      toolbar={{ enableToolbar: !disableToolbarAndPagination }}
      pagination={{ enablePagination: !disableToolbarAndPagination }}
    />
  );
}
