'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { formatDate } from '@/lib/date';
import { createColumnHelper } from '@tanstack/react-table';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { ContactsListItem } from './contacts-table-data';
import { ContactDetailSheet } from './contacts-table-detail-sheet';

const columnHelper = createColumnHelper<ContactsListItem>();

export const columns = [
  columnHelper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
  }),
  columnHelper.accessor('wallet', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Wallet</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
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
