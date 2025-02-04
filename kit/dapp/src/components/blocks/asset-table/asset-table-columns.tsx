'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { AssetDetailConfig } from '@/lib/config/assets';
import type { ColumnHelper } from '@tanstack/react-table';
import { Lock, Pause, Play, Unlock } from 'lucide-react';
import type { ComponentType, ReactElement } from 'react';

export const icons = {
  private: Lock,
  public: Unlock,
  paused: Pause,
  active: Play,
} as const satisfies Record<string, ComponentType>;

export type BaseAsset = {
  id: string;
  name: string | null;
  symbol: string | null;
  decimals: number;
  totalSupply: string;
  paused?: boolean;
  private?: boolean;
};

export function createBaseColumns<T extends BaseAsset>(columnHelper: ColumnHelper<T>) {
  return [
    columnHelper.accessor((row) => row.id, {
      id: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column}>Address</DataTableColumnHeader>,
      cell: ({ getValue }) => (
        <DataTableColumnCell>
          <EvmAddress address={getValue()}>
            <EvmAddressBalances address={getValue()} />
          </EvmAddress>
        </DataTableColumnCell>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => row.name, {
      id: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
      cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => row.symbol, {
      id: 'symbol',
      header: ({ column }) => <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>,
      cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => row.totalSupply, {
      id: 'totalSupply',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} variant="numeric">
          Total Supply
        </DataTableColumnHeader>
      ),
      cell: ({ getValue }) => <DataTableColumnCell variant="numeric">{getValue()}</DataTableColumnCell>,
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => row.private, {
      id: 'private',
      header: ({ column }) => <DataTableColumnHeader column={column}>Private</DataTableColumnHeader>,
      cell: ({ getValue }) => {
        const privateAsset = !!getValue();
        const Icon = icons[privateAsset ? 'private' : 'public'];
        return (
          <DataTableColumnCell>
            {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            <span>{privateAsset ? 'Private' : 'Public'}</span>
          </DataTableColumnCell>
        );
      },
    }),
  ];
}

export function createPausedColumn<T extends BaseAsset>(columnHelper: ColumnHelper<T>) {
  return columnHelper.accessor((row) => row.paused, {
    id: 'paused',
    header: ({ column }) => <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const paused = getValue();
      const Icon = icons[paused ? 'paused' : 'active'];
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
  assetConfig: AssetDetailConfig,
  rowActions?: (row: T) => ReactElement[]
) {
  return columnHelper.display({
    id: 'actions',
    header: () => 'Action',
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
