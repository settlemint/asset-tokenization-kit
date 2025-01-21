'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/evm-address-balances';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactElement } from 'react';
import type { BaseAsset } from './asset-table-types';

export function assetTableColumns<Asset extends BaseAsset>(
  type: string,
  rowActions?: ReactElement[]
): ColumnDef<Asset>[] {
  return [
    {
      id: 'id',
      accessorKey: 'id',
      header: ({ column }) => <DataTableColumnHeader column={column}>Address</DataTableColumnHeader>,
      cell: ({ row }) => (
        <DataTableColumnCell>
          <EvmAddress address={row.getValue('id')}>
            <EvmAddressBalances address={row.getValue('id')} />
          </EvmAddress>
        </DataTableColumnCell>
      ),
      enableColumnFilter: false,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
      cell: ({ row }) => <DataTableColumnCell>{row.getValue('name')}</DataTableColumnCell>,
      enableColumnFilter: false,
    },
    {
      id: 'symbol',
      accessorKey: 'symbol',
      header: ({ column }) => <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>,
      cell: ({ row }) => <DataTableColumnCell>{row.getValue('symbol')}</DataTableColumnCell>,
      enableColumnFilter: false,
    },
    {
      id: 'decimals',
      accessorKey: 'decimals',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} variant="numeric">
          Decimals
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => <DataTableColumnCell variant="numeric">{row.getValue('decimals')}</DataTableColumnCell>,
      enableColumnFilter: true,
    },
    {
      id: 'totalSupply',
      accessorKey: 'totalSupply',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} variant="numeric">
          Total Supply
        </DataTableColumnHeader>
      ),
      cell: ({ row }) => <DataTableColumnCell variant="numeric">{row.getValue('totalSupply')}</DataTableColumnCell>,
      enableColumnFilter: false,
    },
    {
      id: 'actions',
      header: () => '',
      cell: ({ row }) => (
        <DataTableRowActions detailUrl={`/admin/${type}/${row.original.id}`}>{rowActions}</DataTableRowActions>
      ),
      meta: {
        enableCsvExport: false,
      },
    },
  ];
}
