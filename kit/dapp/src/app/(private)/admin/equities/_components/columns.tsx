'use client';

import {
  createActionsColumn,
  createBaseColumns,
  createPausedColumn,
} from '@/components/blocks/asset-table/asset-table-columns';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { createColumnHelper } from '@tanstack/react-table';
import { PauseCircle, PlayCircle } from 'lucide-react';
import type { EquityAsset } from './data';

const columnHelper = createColumnHelper<EquityAsset>();

export const columns = [
  ...createBaseColumns(columnHelper),
  columnHelper.accessor((row) => row.equityCategory, {
    id: 'equityCategory',
    header: ({ column }) => <DataTableColumnHeader column={column}>Category</DataTableColumnHeader>,
    cell: ({ row }) => <DataTableColumnCell>{row.getValue('equityCategory')}</DataTableColumnCell>,
  }),
  columnHelper.accessor((row) => row.equityClass, {
    id: 'equityClass',
    header: ({ column }) => <DataTableColumnHeader column={column}>Class</DataTableColumnHeader>,
    cell: ({ row }) => <DataTableColumnCell>{row.getValue('equityClass')}</DataTableColumnCell>,
  }),
  createPausedColumn(columnHelper),
  createActionsColumn(columnHelper, 'equities'),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
};
