'use client';

import type { ListUser } from '@/app/(private)/admin/users/(table)/_components/data';
import { AddressAvatar } from '@/components/blocks/address-avatar/address-avatar';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/blocks/evm-address/evm-address-balances';
import { Badge } from '@/components/ui/badge';
import { CopyToClipboard } from '@/components/ui/copy';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils/date';
import { createColumnHelper } from '@tanstack/react-table';
import {
  BadgeCheck,
  BadgePlus,
  BadgeX,
  Ban,
  Check,
  ShieldCheck,
  User2,
} from 'lucide-react';
import { type ComponentType, Suspense } from 'react';
import type { Address } from 'viem';
import { BanUserAction } from './actions/ban-user-action';
import { ChangeRoleAction } from './actions/change-role-action';
import { UpdateKycStatusAction } from './actions/update-kyc-status-action';
const columnHelper = createColumnHelper<ListUser>();

export const columns = [
  columnHelper.accessor('name', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>
    ),
    cell: ({ renderValue, row }) => (
      <DataTableColumnCell>
        <Suspense fallback={<Skeleton className="h-8 w-8 rounded-lg" />}>
          <AddressAvatar
            email={row.original.email}
            address={row.original.wallet as Address}
            imageUrl={row.original.image}
            size="small"
          />
        </Suspense>
        <span>{renderValue()}</span>
        {row.original.banned && (
          <Badge variant="destructive">
            Banned for {row.original.ban_reason}
          </Badge>
        )}
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('wallet', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>Wallet</DataTableColumnHeader>
    ),
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        {getValue() && (
          <div className="flex items-center">
            <EvmAddress address={getValue() as Address} prettyNames={false}>
              <EvmAddressBalances address={getValue() as Address} />
            </EvmAddress>
            <CopyToClipboard
              value={getValue()}
              displayText={''}
              className="ml-2"
            />
          </div>
        )}
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('email', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>Email</DataTableColumnHeader>
    ),
    cell: ({ renderValue }) => (
      <DataTableColumnCell>{renderValue()}</DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('role', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>Role</DataTableColumnHeader>
    ),
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
    enableColumnFilter: true,
  }),
  columnHelper.accessor('banned', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>
    ),
    cell: ({ getValue }) => {
      const banned = getValue();
      const status = banned ? 'banned' : 'active';
      const Icon = icons[status];
      return (
        <DataTableColumnCell>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span>{banned ? 'Banned' : 'Active'}</span>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: false,
  }),
  columnHelper.accessor('kyc_verified', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>KYC Status</DataTableColumnHeader>
    ),
    cell: ({ getValue }) => {
      const verified = getValue() as string | undefined;
      const status = verified ? 'verified' : 'notVerified';
      const Icon = icons[status];
      return (
        <DataTableColumnCell>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span>{verified ? 'Verified' : 'Not Verified'}</span>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: false,
  }),
  columnHelper.accessor('lastActivity', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column}>
        Last activity
      </DataTableColumnHeader>
    ),
    cell: ({ getValue }) => {
      const lastActivity = getValue();
      return (
        <DataTableColumnCell>
          {lastActivity ? formatDate(lastActivity, { type: 'distance' }) : '-'}
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <DataTableRowActions detailUrl={`/admin/users/${row.original.id}`}>
        {({ close }) => (
          <>
            <BanUserAction user={row.original} onComplete={close} />
            <ChangeRoleAction user={row.original} onComplete={close} />
            <UpdateKycStatusAction user={row.original} onComplete={close} />
          </>
        )}
      </DataTableRowActions>
    ),
    meta: {
      enableCsvExport: false,
    },
  }),
];

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  admin: ShieldCheck,
  issuer: BadgePlus,
  user: User2,
  banned: Ban,
  active: Check,
  verified: BadgeCheck,
  notVerified: BadgeX,
};
