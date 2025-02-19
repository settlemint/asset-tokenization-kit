'use client';

import { createActionsColumn } from '@/components/blocks/asset-table/asset-table-columns';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { assetConfig } from '@/lib/config/assets';
import { createColumnHelper } from '@tanstack/react-table';
import { Lock, PauseCircle, PlayCircle, Unlock } from 'lucide-react';
import type { Address } from 'viem';
import type { FundAsset } from './data';

const columnHelper = createColumnHelper<FundAsset>();

export const columns = [
  columnHelper.accessor('id', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Address</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <EvmAddress address={getValue() as Address}>
          <EvmAddressBalances address={getValue() as Address} />
        </EvmAddress>
      </DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('name', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('symbol', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{getValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('totalSupply', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Total Supply
      </DataTableColumnHeader>
    ),
    cell: ({ getValue }) => <DataTableColumnCell variant="numeric">{getValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('fundCategory', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Category</DataTableColumnHeader>,
    cell: ({ row }) => <DataTableColumnCell>{row.getValue('fundCategory')}</DataTableColumnCell>,
  }),
  columnHelper.accessor('fundClass', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Class</DataTableColumnHeader>,
    cell: ({ row }) => <DataTableColumnCell>{row.getValue('fundClass')}</DataTableColumnCell>,
  }),
  columnHelper.accessor('paused', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const paused = getValue();
      const Icon = icons[paused ? 'paused' : 'active'];
      return (
        <DataTableColumnCell>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span>{paused ? 'Paused' : 'Active'}</span>
        </DataTableColumnCell>
      );
    },
  }),
  columnHelper.accessor('private', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Private</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const privateAsset = !!getValue();
      const Icon = icons[privateAsset ? 'private' : 'public'];
      return (
        <DataTableColumnCell>
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          <span>{privateAsset ? 'Private' : 'Public'}</span>
        </DataTableColumnCell>
      );
    },
  }),
  createActionsColumn(columnHelper, assetConfig.fund),
];
export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
  private: Lock,
  public: Unlock,
};
