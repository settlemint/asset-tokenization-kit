'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { CopyToClipboard } from '@/components/ui/copy';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/date';
import { createColumnHelper } from '@tanstack/react-table';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Suspense } from 'react';
import type { Address } from 'viem';
import type { ContactsListItem } from './contacts-table-data';
import { ContactDetailSheet } from './contacts-table-detail-sheet';

const columnHelper = createColumnHelper<ContactsListItem>();

export const columns = [
  columnHelper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
    cell: ({ renderValue, row }) => (
      <DataTableColumnCell>
        <Suspense fallback={<Skeleton className="h-8 w-8 rounded-lg" />}>
          <AddressAvatar
            email={undefined}
            address={row.original.wallet as Address}
            imageUrl={undefined}
            variant="small"
          />
        </Suspense>
        <span>{renderValue()}</span>
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('wallet', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Wallet</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        {getValue() && (
          <div className="flex items-center">
            <EvmAddress address={getValue() as Address} prettyNames={false}>
              <EvmAddressBalances address={getValue() as Address} />
            </EvmAddress>
            <CopyToClipboard value={getValue()} displayText={''} className="ml-2" />
          </div>
        )}
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('created_at', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Created At</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{formatDate(getValue() as Date)}</DataTableColumnCell>,
  }),
  columnHelper.accessor('updated_at', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Updated At</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{formatDate(getValue() as Date)}</DataTableColumnCell>,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <DataTableColumnCell>
        <ContactDetailSheet
          id={row.original.id}
          wallet={row.original.wallet}
          name={row.original.name}
          created_at={row.original.created_at}
          updated_at={row.original.updated_at}
          user_id={row.original.user_id}
        />
      </DataTableColumnCell>
    ),
  }),
];

export const icons = {
  success: CheckCircle,
  failed: XCircle,
  pending: Clock,
};
