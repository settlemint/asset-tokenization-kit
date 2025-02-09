'use client';

import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import type { AssetDetailConfig } from '@/lib/config/assets';
import type { ColumnHelper } from '@tanstack/react-table';
import type { ReactElement } from 'react';

export type BaseAsset = {
  id: string;
  name: string | null;
  symbol: string | null;
  decimals: number;
  totalSupply: string;
  paused?: boolean;
  private?: boolean;
};

export function createActionsColumn<T extends BaseAsset>(
  columnHelper: ColumnHelper<T>,
  assetConfig: AssetDetailConfig,
  rowActions?: (row: T) => ReactElement[]
) {
  return columnHelper.display({
    id: 'actions',
    header: ({ column }) => <DataTableColumnHeader column={column}>Action</DataTableColumnHeader>,
    cell: ({ row }) => {
      return (
        <DataTableRowActions detailUrl={`/admin/${assetConfig.urlSegment}/${row.original.id}`}>
          {rowActions?.(row.original)}
        </DataTableRowActions>
      );
    },
    meta: {
      enableCsvExport: false,
    },
  });
}
