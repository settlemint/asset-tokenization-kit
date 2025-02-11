'use client';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { createColumnHelper } from '@tanstack/react-table';
import { Lock, PauseCircle, PlayCircle, Unlock } from 'lucide-react';
import type { NormalizedTransactionListItem } from './data';

const columnHelper = createColumnHelper<NormalizedTransactionListItem>();

export const columns = [
  columnHelper.accessor('timestamp', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Timestamp</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('asset', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Asset</DataTableColumnHeader>,
    cell: ({ getValue, row }) => {
      const asset = getValue();

      return (
        <DataTableColumnCell>
          <EvmAddress address={asset} name={row.original.emitterName} symbol={row.original.emitterSymbol}>
            <EvmAddressBalances address={asset} />
          </EvmAddress>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: true,
  }),
  columnHelper.accessor('event', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Event</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
    enableColumnFilter: true,
  }),
  columnHelper.accessor('sender', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Sender</DataTableColumnHeader>,
    cell: ({ getValue, row }) => {
      const senderId = getValue();

      return (
        <DataTableColumnCell>
          <EvmAddress address={senderId} name={row.original.senderName}>
            <EvmAddressBalances address={senderId} />
          </EvmAddress>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: true,
  }),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
  private: Lock,
  public: Unlock,
};
