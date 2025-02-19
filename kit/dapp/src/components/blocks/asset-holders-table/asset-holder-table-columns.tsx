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
import type { Holder } from './asset-holders-table-data';

const columnHelper = createColumnHelper<Holder>();

export const columns = (address: Address, assetConfig: AssetDetailConfig) => [
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
  ...(assetConfig.features.ERC20Custodian
    ? [
        columnHelper.accessor('frozen', {
          header: ({ column }) => (
            <DataTableColumnHeader column={column} variant="numeric">
              Frozen
            </DataTableColumnHeader>
          ),
          cell: ({ getValue }) => (
            <DataTableColumnCell variant="numeric">{formatNumber(getValue())}</DataTableColumnCell>
          ),
          enableColumnFilter: false,
        }),
      ]
    : []),
  ...(assetConfig.features.ERC20Custodian
    ? [
        columnHelper.accessor('blocked', {
          header: ({ column }) => <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>,
          cell: ({ getValue }) => {
            const frozen = getValue();
            const Icon = icons[frozen ? 'blocked' : 'unblocked'];
            return (
              <DataTableColumnCell>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                <span>{frozen ? 'Frozen' : 'Active'}</span>
              </DataTableColumnCell>
            );
          },
        }),
      ]
    : []),
  columnHelper.accessor('account.lastActivity', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Last activity</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>{getValue() ? formatDate(getValue(), { type: 'distance' }) : '-'}</DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  // columnHelper.display({
  //   id: 'actions',
  //   header: ({ column }) => <DataTableColumnHeader column={column}>Action</DataTableColumnHeader>,
  //   cell: ({ row }) => {
  //     return (
  //       <DataTableRowActions>
  //         {assetConfig.features.ERC20Blocklist && (
  //           <BlockButton
  //             address={address}
  //             currentlyBlocked={row.original.blocked}
  //             userAddress={row.original.account.id as Address}
  //           />
  //         )}
  //       </DataTableRowActions>
  //     );
  //   },
  //   meta: {
  //     enableCsvExport: false,
  //   },
  // }),
];

export const icons = {
  blocked: XCircle,
  unblocked: CheckCircle,
};
