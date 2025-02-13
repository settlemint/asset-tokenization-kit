'use client';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Badge } from '@/components/ui/badge';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { createColumnHelper } from '@tanstack/react-table';
import type { getAssetEvents } from './data';

const columnHelper = createColumnHelper<Awaited<ReturnType<typeof getAssetEvents>>[number]>();

export const columns = [
  columnHelper.accessor('timestamp', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Timestamp</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <span className="[&:first-letter]:uppercase">{getValue()}</span>
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
    enableGlobalFilter: false,
  }),
  columnHelper.accessor('sender', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Sender</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <EvmAddress address={getValue()}>
          <EvmAddressBalances address={getValue()} />
        </EvmAddress>
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
    enableGlobalFilter: false,
  }),
  columnHelper.accessor('description', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Description</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
    enableGlobalFilter: false,
  }),
  columnHelper.accessor('status', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const status = getValue();

      return (
        <DataTableColumnCell>
          <Badge variant={status === 'pending' ? 'warning' : status === 'failed' ? 'destructive' : 'success'}>
            <span className="[&:first-letter]:uppercase">{status}</span>
          </Badge>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: false,
    enableGlobalFilter: false,
  }),
];
