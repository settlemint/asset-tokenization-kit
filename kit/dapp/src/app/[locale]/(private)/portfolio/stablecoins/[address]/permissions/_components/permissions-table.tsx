'use client';

import { DataTable } from '@/components/blocks/data-table/data-table';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { getRoleDisplayName, type Role } from '@/lib/config/roles';
import {
  useAssetDetail,
  type PermissionWithRoles,
} from '@/lib/queries/asset/asset-detail';
import { formatDate } from '@/lib/utils/date';
import { createColumnHelper } from '@tanstack/react-table';
import type { Address } from 'viem';
import { EditPermissionsForm } from './actions/edit-form/form';
import { RevokeAllPermissionsForm } from './actions/revoke-all-form/form';

interface PermissionsTableProps {
  address: Address;
}

const columnHelper = createColumnHelper<PermissionWithRoles>();

export function PermissionsTable({ address }: PermissionsTableProps) {
  const {
    data: { roles },
  } = useAssetDetail({ address });

  const columns = [
    columnHelper.accessor('id', {
      header: 'Wallet',
      cell: ({ getValue }) => {
        const wallet = getValue();
        return (
          <EvmAddress address={wallet} copyToClipboard={true} verbose={true}>
            <EvmAddressBalances address={wallet} />
          </EvmAddress>
        );
      },
      enableColumnFilter: false,
    }),
    columnHelper.accessor('roles', {
      header: 'Roles',
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {getValue().map((role: Role) => (
            <span key={role} className="rounded bg-muted px-2 py-1 text-xs">
              {getRoleDisplayName(role)}
            </span>
          ))}
        </div>
      ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor('lastActivity', {
      header: 'Last Activity',
      cell: ({ getValue }) =>
        getValue() ? formatDate(getValue(), { type: 'distance' }) : '-',
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: 'actions',
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>Action</DataTableColumnHeader>
      ),
      cell: ({ row }) => {
        return (
          <DataTableRowActions>
            <EditPermissionsForm address={address} account={row.original.id} />
            <RevokeAllPermissionsForm
              address={address}
              account={row.original.id}
            />
          </DataTableRowActions>
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];

  return <DataTable columns={columns} data={roles} name={'Permissions'} />;
}
