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
  columnHelper.accessor('account.id', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Wallet</DataTableColumnHeader>,
    cell: ({ getValue, row }) => {
      const wallet = getValue();
      return (
        <DataTableColumnCell>
          {wallet && (
            <div className="flex items-center">
              <EvmAddress address={wallet} name={row.original.name}>
                <EvmAddressBalances address={wallet} />
              </EvmAddress>
              <CopyToClipboard value={wallet} displayText={''} className="ml-2" />
            </div>
          )}
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: false,
  }),
  columnHelper.accessor('value', {
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
  columnHelper.accessor('type', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Type</DataTableColumnHeader>,
    cell: ({ renderValue }) => {
      return <DataTableColumnCell>{renderValue()}</DataTableColumnCell>;
    },
    enableColumnFilter: true,
  }),
  columnHelper.accessor('lastActivity', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Last activity</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue() ? formatDate(getValue()) : '-'}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
];
