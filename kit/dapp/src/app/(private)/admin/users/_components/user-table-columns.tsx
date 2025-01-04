'use client';

import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { Badge } from '@/components/ui/badge';
import type { auth } from '@/lib/auth/auth';
import { createColumnHelper } from '@tanstack/react-table';
import { BadgePlus, Ban, Check, ShieldCheck, User2 } from 'lucide-react';
import type { ComponentType } from 'react';

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  issuer: BadgePlus,
  user: User2,
  banned: Ban,
  active: Check,
};

type User = (typeof auth.$Infer.Session)['user'];

const columnHelper = createColumnHelper<User>();

export const columns = [
  columnHelper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
    cell: ({ renderValue, row }) => (
      <DataTableColumnCell>
        <AddressAvatar
          email={row.original.email}
          address={row.original.wallet}
          imageUrl={row.original.image}
          variant="small"
        />
        <span>{renderValue()}</span>
        {row.original.banned && <Badge variant="destructive">Banned</Badge>}
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
      <DataTableColumnCell>{getValue() && <EvmAddress address={getValue()} />}</DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: () => <DataTableRowActions>xxx</DataTableRowActions>,
  }),
];
