'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { CopyToClipboard } from '@/components/ui/copy';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { formatDate } from '@/lib/date';
import { formatNumber } from '@/lib/number';
import { createColumnHelper } from '@tanstack/react-table';
import type { StablecoinHoldersBalance } from './data';

const columnHelper = createColumnHelper<StablecoinHoldersBalance>();

export const columns = [
  columnHelper.accessor('name', {
    id: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('account.id', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Wallet</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        {getValue() && (
          <div className="flex items-center">
            <EvmAddress address={getValue()}>
              <EvmAddressBalances address={getValue()} />
            </EvmAddress>
            <CopyToClipboard value={getValue()} displayText={''} className="ml-2" />
          </div>
        )}
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('value', {
    id: 'value',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Balance
      </DataTableColumnHeader>
    ),
    cell: ({ getValue, row }) => (
      <DataTableColumnCell variant="numeric">
        {formatNumber(getValue(), {
          currency: row.original.symbol,
        })}
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('admins', {
    id: 'type',
    header: ({ column }) => <DataTableColumnHeader column={column}>Type</DataTableColumnHeader>,
    cell: ({ getValue, row }) => {
      const admins = getValue() as string[];
      const isAdmin = admins.includes(row.original.account.id);
      return <DataTableColumnCell>{isAdmin ? 'Creator / Owner' : 'Regular holder'}</DataTableColumnCell>;
    },
    enableColumnFilter: false,
  }),
  columnHelper.accessor('lastActivity', {
    id: 'lastActivity',
    header: ({ column }) => <DataTableColumnHeader column={column}>Last activity</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>{getValue() ? formatDate(getValue() as Date) : '-'}</DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
];
