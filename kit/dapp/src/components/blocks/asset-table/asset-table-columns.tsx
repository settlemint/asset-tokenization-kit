'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/evm-address-balances';
import type { ColumnDef } from '@tanstack/react-table';
import type { ReactElement } from 'react';
import { DataTableRowActions } from '../data-table/data-table-row-actions';
import type { BaseAsset } from './asset-table-types';

export const idColumn: ColumnDef<BaseAsset> = {
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
};

export const nameColumn: ColumnDef<BaseAsset> = {
  id: 'name',
  accessorKey: 'name',
  header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
  cell: ({ row }) => <DataTableColumnCell>{row.getValue('name')}</DataTableColumnCell>,
  enableColumnFilter: false,
};

export const symbolColumn: ColumnDef<BaseAsset> = {
  id: 'symbol',
  accessorKey: 'symbol',
  header: ({ column }) => <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>,
  cell: ({ row }) => <DataTableColumnCell>{row.getValue('symbol')}</DataTableColumnCell>,
  enableColumnFilter: false,
};

export const decimalsColumn: ColumnDef<BaseAsset> = {
  id: 'decimals',
  accessorKey: 'decimals',
  header: ({ column }) => <DataTableColumnHeader column={column}>Decimals</DataTableColumnHeader>,
  cell: ({ row }) => <DataTableColumnCell>{row.getValue('decimals')}</DataTableColumnCell>,
  enableColumnFilter: false,
};

export const totalSupplyColumn: ColumnDef<BaseAsset> = {
  id: 'totalSupply',
  accessorKey: 'totalSupply',
  header: ({ column }) => <DataTableColumnHeader column={column}>Total Supply</DataTableColumnHeader>,
  cell: ({ row }) => <DataTableColumnCell>{row.getValue('totalSupply')}</DataTableColumnCell>,
  enableColumnFilter: false,
};

export function detailsColumn(type: string, rowActions?: ReactElement[]) {
  return {
    id: 'details',
    header: () => '',
    cell: ({ row }) => (
      <DataTableRowActions detailUrl={`/admin/${type}/${row.original.id}`}>{rowActions}</DataTableRowActions>
    ),
    meta: {
      enableCsvExport: false,
    },
  } as ColumnDef<BaseAsset>;
}

export function defaultAssetTableColumns(type: string, rowActions?: ReactElement[]) {
  return [idColumn, nameColumn, symbolColumn, decimalsColumn, totalSupplyColumn, detailsColumn(type, rowActions)];
}
