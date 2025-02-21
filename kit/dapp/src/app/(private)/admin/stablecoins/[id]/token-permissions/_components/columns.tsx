'use client';

import type { PermissionWithRoles } from '@/components/blocks/asset-permissions-table/asset-permissions-table-data';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { type Role, getRoleDisplayName } from '@/lib/config/roles';
import { formatDate } from '@/lib/date';
import { createColumnHelper } from '@tanstack/react-table';
import {} from 'lucide-react';
import type { Address } from 'viem';
import { EditButton } from './actions/edit-form/button';
import { RevokeAllButton } from './actions/revoke-all-form/button';

const columnHelper = createColumnHelper<PermissionWithRoles>();

export const columns = (address: Address, assetConfig: AssetDetailConfig) => [
  columnHelper.accessor('id', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Wallet</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const wallet = getValue();
      return (
        <DataTableColumnCell>
          {wallet && (
            <div className="flex items-center">
              <EvmAddress address={wallet as Address} copyToClipboard={true} verbose={true}>
                <EvmAddressBalances address={wallet as Address} />
              </EvmAddress>
            </div>
          )}
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: false,
  }),
  columnHelper.accessor('roles', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Roles</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <div className="flex flex-wrap gap-1">
          {getValue()?.map((role: Role) => (
            <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
              {getRoleDisplayName(role)}
            </span>
          ))}
        </div>
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
  columnHelper.display({
    id: 'actions',
    header: ({ column }) => <DataTableColumnHeader column={column}>Action</DataTableColumnHeader>,
    cell: ({ row }) => {
      return (
        <DataTableRowActions>
          <EditButton
            address={address}
            currentRoles={row.original.roles}
            userAddress={row.original.id as Address}
            assetConfig={assetConfig}
          />
          <RevokeAllButton
            address={address}
            currentRoles={row.original.roles}
            userAddress={row.original.id as Address}
            assetConfig={assetConfig}
          />
        </DataTableRowActions>
      );
    },
    meta: {
      enableCsvExport: false,
    },
  }),
];
