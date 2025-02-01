'use client';

import {
  createActionsColumn,
  createBaseColumns,
  createPausedColumn,
} from '@/components/blocks/asset-table/asset-table-columns';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { TokenType } from '@/types/token-types';
import { createColumnHelper } from '@tanstack/react-table';
import { PauseCircle, PlayCircle } from 'lucide-react';
import type { FundAsset } from './data';

const columnHelper = createColumnHelper<FundAsset>();

export const columns = [
  ...createBaseColumns(columnHelper),
  columnHelper.accessor((row) => row.fundCategory, {
    id: 'fundCategory',
    header: ({ column }) => <DataTableColumnHeader column={column}>Category</DataTableColumnHeader>,
    cell: ({ row }) => <DataTableColumnCell>{row.getValue('fundCategory')}</DataTableColumnCell>,
  }),
  columnHelper.accessor((row) => row.fundClass, {
    id: 'fundClass',
    header: ({ column }) => <DataTableColumnHeader column={column}>Class</DataTableColumnHeader>,
    cell: ({ row }) => <DataTableColumnCell>{row.getValue('fundClass')}</DataTableColumnCell>,
  }),
  createPausedColumn(columnHelper),
  createActionsColumn(columnHelper, TokenType.Fund),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
};
