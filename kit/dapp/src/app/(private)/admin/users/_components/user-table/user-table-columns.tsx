'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/evm-address-balances';
import { Badge } from '@/components/ui/badge';
import { CopyToClipboard } from '@/components/ui/copy';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/lib/auth/types';
import { createColumnHelper } from '@tanstack/react-table';
import { Suspense } from 'react';
import { BanUserAction } from './actions/ban-user-action';
import { ChangeRoleAction } from './actions/change-role-action';
import { icons } from './user-table-icons';

const columnHelper = createColumnHelper<User>();

export const columns = [
  // columnHelper.display({
  //   id: 'select',
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px] border-background"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px] border-background"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  //   meta: {
  //     enableCsvExport: false,
  //   },
  // }),
  columnHelper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
    cell: ({ renderValue, row }) => (
      <DataTableColumnCell>
        <Suspense fallback={<Skeleton className="h-8 w-8 rounded-lg" />}>
          <AddressAvatar
            email={row.original.email}
            address={row.original.wallet}
            imageUrl={row.original.image}
            variant="small"
          />
        </Suspense>
        <span>{renderValue()}</span>
        {row.original.banned && <Badge variant="destructive">Banned for {row.original.banReason}</Badge>}
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('email', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Email</DataTableColumnHeader>,
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('role', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Role</DataTableColumnHeader>,
    cell: ({ renderValue }) => {
      const role = renderValue();
      const Icon = role ? icons[role] : null;
      return (
        <DataTableColumnCell>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span>{role}</span>
        </DataTableColumnCell>
      );
    },
  }),
  columnHelper.accessor('wallet', {
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
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <DataTableRowActions detailUrl={`/admin/users/${row.original.id}`}>
        <BanUserAction user={row.original} />
        <ChangeRoleAction user={row.original} />
      </DataTableRowActions>
    ),
    meta: {
      enableCsvExport: false,
    },
  }),
];
