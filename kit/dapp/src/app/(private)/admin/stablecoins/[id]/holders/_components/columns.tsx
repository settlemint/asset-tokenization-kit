'use client';

import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import type { AssetDetailConfig } from '@/lib/config/assets';
import { formatDate } from '@/lib/date';
import { formatNumber } from '@/lib/number';
import { createColumnHelper } from '@tanstack/react-table';
import { CheckCircle, XCircle } from 'lucide-react';
import type { Address } from 'viem';

import type { Holder } from '@/components/blocks/asset-holders-table/asset-holders-table-data';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { BlockButton } from './actions/block-form/button';
import { FreezeButton } from './actions/freeze-form/button';

const columnHelper = createColumnHelper<Holder>();

export const columns = (address: Address, decimals: number, assetConfig: AssetDetailConfig) => [
  columnHelper.accessor('account.id', {
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
  columnHelper.accessor('value', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Balance
      </DataTableColumnHeader>
    ),
    cell: ({ getValue }) => <DataTableColumnCell variant="numeric">{formatNumber(getValue())}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),

  columnHelper.accessor('frozen', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Frozen
      </DataTableColumnHeader>
    ),
    cell: ({ getValue }) => <DataTableColumnCell variant="numeric">{formatNumber(getValue())}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('blocked', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const blocked = getValue();
      const Icon = icons[blocked ? 'blocked' : 'unblocked'];
      return (
        <DataTableColumnCell>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span>{blocked ? 'Blocked' : 'Active'}</span>
        </DataTableColumnCell>
      );
    },
  }),
  columnHelper.accessor('account.lastActivity', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Last activity</DataTableColumnHeader>,
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
          <BlockButton address={address} currentlyBlocked={row.original.blocked} assetConfig={assetConfig} />
          <FreezeButton
            address={address}
            decimals={decimals}
            currentFrozen={row.original.frozen}
            currentBalance={row.original.value}
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

export const icons = {
  blocked: XCircle,
  unblocked: CheckCircle,
};
