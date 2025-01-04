'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { createColumnHelper } from '@tanstack/react-table';
import type { UserWithRole } from 'better-auth/plugins';
import { BadgePlus, ShieldCheck, User2 } from 'lucide-react';
import type { ComponentType } from 'react';

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  issuer: BadgePlus,
  user: User2,
};

const columnHelper = createColumnHelper<UserWithRole>();

export const columns = [
  columnHelper.accessor('email', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Email</DataTableColumnHeader>,
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
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
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: () => <DataTableRowActions>xxx</DataTableRowActions>,
  }),
];
