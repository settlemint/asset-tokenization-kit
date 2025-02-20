'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { TransactionHash } from '@/components/blocks/transaction-hash/transaction-hash';
import { formatDate } from '@/lib/date';
import { createColumnHelper } from '@tanstack/react-table';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Address } from 'viem';
import { TransactionDetailSheet } from './transaction-table-detail-sheet';
import type { TransactionListItem } from './transactions-table-data';

const columnHelper = createColumnHelper<TransactionListItem>();

export const columns = [
  columnHelper.accessor('status', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const status = getValue();
      const Icon = status === 'Success' ? icons.success : status === 'Failed' ? icons.failed : icons.pending;
      return (
        <DataTableColumnCell>
          <div className="flex items-center gap-2">
            <Icon
              className={
                status === 'Success'
                  ? 'text-success'
                  : status === 'Failed'
                    ? 'text-destructive'
                    : 'text-muted-foreground'
              }
              size={18}
            />
            <span>{status}</span>
          </div>
        </DataTableColumnCell>
      );
    },
  }),
  columnHelper.accessor('createdAt', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Timestamp</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{formatDate(getValue() ?? new Date())}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('functionName', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Function</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell className="capitalize">{getValue()}</DataTableColumnCell>,
  }),
  columnHelper.accessor('from', {
    header: ({ column }) => <DataTableColumnHeader column={column}>From</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <EvmAddress address={getValue() as Address} />
      </DataTableColumnCell>
    ),
  }),
  columnHelper.accessor('address', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Contract</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <EvmAddress address={getValue() as Address} />
      </DataTableColumnCell>
    ),
  }),
  columnHelper.accessor('transactionHash', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Transaction</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <TransactionHash hash={getValue()} />
      </DataTableColumnCell>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <DataTableColumnCell>
        <TransactionDetailSheet
          status={row.original.status}
          address={row.original.address}
          createdAt={row.original.createdAt}
          from={row.original.from}
          functionName={row.original.functionName}
          metadata={row.original.metadata}
          transactionHash={row.original.transactionHash}
          updatedAt={row.original.updatedAt}
          receipt={row.original.receipt}
        />
      </DataTableColumnCell>
    ),
    meta: {
      enableCsvExport: false,
    },
  }),
];

export const icons = {
  success: CheckCircle,
  failed: XCircle,
  pending: Clock,
};
