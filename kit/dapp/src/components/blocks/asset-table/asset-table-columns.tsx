'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/evm-address-balances';
import type { ColumnHelper } from '@tanstack/react-table';
import { Pause, Play } from 'lucide-react';
import type { ReactElement } from 'react';

export const icons = {
  paused: Pause,
  active: Play,
} as const;

export type BaseAsset = {
  id: string;
  name: string | null;
  symbol: string | null;
  decimals: number;
  totalSupply: string;
  paused?: boolean;
};

export function createBaseColumns<T extends BaseAsset>(columnHelper: ColumnHelper<T>) {
  return [
    columnHelper.accessor((row) => row.id, {
      id: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column}>Address</DataTableColumnHeader>,
      cell: ({ row }) => (
        <DataTableColumnCell>
          <EvmAddress address={row.getValue('id')}>
            <EvmAddressBalances address={row.getValue('id')} />
          </EvmAddress>
        </DataTableColumnCell>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => row.name ?? row.id, {
      id: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
      cell: ({ row }) => <DataTableColumnCell>{row.getValue('name')}</DataTableColumnCell>,
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => row.symbol ?? row.id, {
      id: 'symbol',
      header: ({ column }) => <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>,
      cell: ({ row }) => <DataTableColumnCell>{row.getValue('symbol')}</DataTableColumnCell>,
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => row.decimals, {
      id: 'decimals',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} variant="numeric">
          Decimals
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => <DataTableColumnCell variant="numeric">{row.getValue('decimals')}</DataTableColumnCell>,
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => row.totalSupply, {
      id: 'totalSupply',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} variant="numeric">
          Total Supply
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => <DataTableColumnCell variant="numeric">{row.getValue('totalSupply')}</DataTableColumnCell>,
      enableColumnFilter: false,
    }),
  ];
}

export function createPausedColumn<T extends BaseAsset>(columnHelper: ColumnHelper<T>) {
  return columnHelper.accessor((row) => row.paused, {
    id: 'paused',
    header: ({ column }) => <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const paused = getValue();
      const Icon = paused ? icons[paused ? 'paused' : 'active'] : null;
      return (
        <DataTableColumnCell>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span>{paused ? 'Paused' : 'Active'}</span>
        </DataTableColumnCell>
      );
    },
  });
}

export function createActionsColumn<T extends BaseAsset>(
  columnHelper: ColumnHelper<T>,
  type: 'bonds' | 'equities' | 'stablecoins' | 'cryptocurrencies',
  rowActions?: (row: T) => ReactElement[]
) {
  return columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <DataTableRowActions detailUrl={`/admin/${type}/${row.original.id}`}>
        {rowActions?.(row.original)}
      </DataTableRowActions>
    ),
    meta: {
      enableCsvExport: false,
    },
  });
}
