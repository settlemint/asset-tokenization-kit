'use client';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/evm-address-balances';
import { createColumnHelper } from '@tanstack/react-table';
import type { CryptoCurrency } from './cryptocurrency-table';

const columnHelper = createColumnHelper<CryptoCurrency>();

export const columns = [
  columnHelper.accessor('id', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Address</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        {getValue() && (
          <EvmAddress address={getValue()}>
            <EvmAddressBalances address={getValue()} />
          </EvmAddress>
        )}
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('symbol', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>,
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('decimals', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Decimals
      </DataTableColumnHeader>
    ),
    cell: ({ renderValue }) => <DataTableColumnCell variant="numeric">{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('totalSupply', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Total Supply
      </DataTableColumnHeader>
    ),
    cell: ({ renderValue }) => <DataTableColumnCell variant="numeric">{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => <DataTableRowActions detailUrl={`/admin/cryptocurrencies/${row.original.id}`} />,
    meta: {
      enableCsvExport: false,
    },
  }),
];
