'use client';

import { createActionsColumn } from '@/components/blocks/asset-table/asset-table-columns';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { EvmAddress } from '@/components/blocks/evm-address/evm-address';
import { EvmAddressBalances } from '@/components/ui/evm-address-balances';
import { assetConfig } from '@/lib/config/assets';
import { formatNumber } from '@/lib/number';
import { cn } from '@/lib/utils';
import { createColumnHelper } from '@tanstack/react-table';
import BigNumber from 'bignumber.js';
import { AlertCircle, AlertTriangle, CheckCircle, Lock, PauseCircle, PlayCircle, Unlock } from 'lucide-react';
import type { StableCoinAsset } from './data';

const columnHelper = createColumnHelper<StableCoinAsset>();

export const columns = [
  columnHelper.accessor('id', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Address</DataTableColumnHeader>,
    cell: ({ getValue }) => (
      <DataTableColumnCell>
        <EvmAddress address={getValue()}>
          <EvmAddressBalances address={getValue()} />
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
  columnHelper.accessor('collateral', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Collateral
      </DataTableColumnHeader>
    ),
    cell: ({ getValue, row }) => {
      const totalSupply = new BigNumber(row.getValue<string>('totalSupply'));
      const collateral = new BigNumber(getValue());
      const ratio = totalSupply.eq(0) ? new BigNumber(100) : collateral.div(totalSupply).times(100);
      const { Icon, color } = getCollateralStatus(totalSupply, collateral);
      return (
        <DataTableColumnCell variant="numeric">
          <div className={cn('flex items-center gap-2', color)}>
            <Icon className="h-4 w-4" />
            <span>{formatNumber(ratio)}</span>
          </div>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: false,
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
  createActionsColumn(columnHelper, assetConfig.stablecoin),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
  dangerCollateral: AlertTriangle,
  warningCollateral: AlertCircle,
  okCollateral: CheckCircle,
  private: Lock,
  public: Unlock,
};

const getCollateralStatus = (totalSupply: BigNumber, collateral: BigNumber) => {
  if (totalSupply.eq(0)) {
    return { status: 'ok', Icon: icons.okCollateral };
  }
  const ratio = collateral.div(totalSupply).times(100);
  if (ratio.gt(90)) {
    return { status: 'ok', Icon: icons.okCollateral };
  }
  if (ratio.gt(70)) {
    return { status: 'warning', Icon: icons.warningCollateral, color: 'text-warning' };
  }
  return { status: 'danger', Icon: icons.dangerCollateral, color: 'text-destructive' };
};
