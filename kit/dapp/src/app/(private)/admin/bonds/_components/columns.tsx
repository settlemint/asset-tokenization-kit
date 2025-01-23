'use client';

import {
  createActionsColumn,
  createBaseColumns,
  createPausedColumn,
} from '@/components/blocks/asset-table/asset-table-columns';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { createColumnHelper } from '@tanstack/react-table';
import { PauseCircle, PlayCircle } from 'lucide-react';
import type { BondAsset } from './data';

const columnHelper = createColumnHelper<BondAsset>();

export const columns = [
  ...createBaseColumns(columnHelper),
  columnHelper.accessor((row) => row.faceValue, {
    id: 'faceValue',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Face Value
      </DataTableColumnHeader>
    ),
    cell: ({ row }) => <DataTableColumnCell variant="numeric">{row.getValue('faceValue')}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor((row) => row.underlyingAsset, {
    id: 'underlyingAsset',
    header: ({ column }) => <DataTableColumnHeader column={column}>Underlying Asset</DataTableColumnHeader>,
    cell: ({ row }) => (
      <DataTableColumnCell>
        <EvmAddress address={row.getValue('underlyingAsset')} />
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor((row) => row.redeemedAmount, {
    id: 'redeemedAmount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Redeemed Amount
      </DataTableColumnHeader>
    ),
    cell: ({ row }) => <DataTableColumnCell variant="numeric">{row.getValue('redeemedAmount')}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  createPausedColumn(columnHelper),
  createActionsColumn(columnHelper, 'bonds'),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
};
