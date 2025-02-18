'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { createColumnHelper } from '@tanstack/react-table';
import { Lock, PauseCircle, PlayCircle, Unlock } from 'lucide-react';
import type { NormalizedEventsListItem } from '../asset-events-fragments';
import { EventDetailSheet } from '../details/detail-sheet';

const columnHelper = createColumnHelper<NormalizedEventsListItem>();

export const columns = [
  columnHelper.accessor('timestamp', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Timestamp</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <span className="[&:first-letter]:uppercase">{getValue()}</span>
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('asset', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Asset</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const asset = getValue();

      return (
        <DataTableColumnCell>
          <EvmAddress address={asset}>
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
    cell: ({ getValue }) => {
      const senderId = getValue();

      return (
        <DataTableColumnCell>
          <EvmAddress address={senderId}>
            <EvmAddressBalances address={senderId} />
          </EvmAddress>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: true,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <DataTableColumnCell>
        <EventDetailSheet
          event={row.original.event}
          sender={row.original.sender}
          asset={row.original.asset}
          timestamp={row.original.timestamp}
          details={row.original.details}
          transactionHash={row.original.transactionHash}
        />
      </DataTableColumnCell>
    ),
    meta: {
      enableCsvExport: false,
    },
  }),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
  private: Lock,
  public: Unlock,
};
