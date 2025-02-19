'use client';

import type { AssetDetailConfig } from '@/lib/config/assets';
import { formatDate } from '@/lib/date';
import { createColumnHelper } from '@tanstack/react-table';
import type { Address } from 'viem';
import { DataTableColumnCell } from '../data-table/data-table-column-cell';
import { DataTableColumnHeader } from '../data-table/data-table-column-header';
import { EvmAddress } from '../evm-address/evm-address';
import type { PermissionRole, PermissionWithRoles } from './asset-permissions-table-data';

const columnHelper = createColumnHelper<PermissionWithRoles>();

export const columns = (address: Address, assetConfig: AssetDetailConfig) => [
  // columnHelper.accessor('account.name', {
  //   header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
  //   cell: ({ getValue }) => <DataTableColumnCell>{getValue() || '-'}</DataTableColumnCell>,
  //   enableColumnFilter: true,
  // }),
  columnHelper.accessor('roles', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Roles</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <div className="flex flex-wrap gap-1">
          {getValue()?.map((role: PermissionRole) => (
            <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
              {role}
            </span>
          ))}
        </div>
      </DataTableColumnCell>
    ),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('id', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Address</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <EvmAddress address={getValue() as Address} copyToClipboard={true} verbose={true} />
      </DataTableColumnCell>
    ),
    enableColumnFilter: true,
  }),
  columnHelper.accessor('lastActivity', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Last Activity</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>{getValue() ? formatDate(getValue(), { type: 'distance' }) : '-'}</DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
];
