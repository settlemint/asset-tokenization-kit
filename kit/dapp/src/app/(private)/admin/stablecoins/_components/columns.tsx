'use client';

import {
  createActionsColumn,
  createBaseColumns,
  createPausedColumn,
} from '@/components/blocks/asset-table/asset-table-columns';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { createColumnHelper } from '@tanstack/react-table';
import type { StableCoinAsset } from './data';

const columnHelper = createColumnHelper<StableCoinAsset>();

export const columns = [
  ...createBaseColumns(columnHelper),
  columnHelper.accessor((row) => row.collateral, {
    id: 'collateral',
    header: ({ column }) => <DataTableColumnHeader column={column}>Collateral</DataTableColumnHeader>,
    cell: ({ row }) => <DataTableColumnCell>{row.getValue('collateral')}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  createPausedColumn(columnHelper),
  createActionsColumn(columnHelper, 'stablecoins'),
];
