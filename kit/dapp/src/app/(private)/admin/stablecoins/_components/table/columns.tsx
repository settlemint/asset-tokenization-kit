'use client';

import {
  createActionsColumn,
  createBaseColumns,
  createPausedColumn,
} from '@/components/blocks/asset-table/asset-table-columns';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { assetConfig } from '@/lib/config/assets';
import { formatNumber } from '@/lib/number';
import { cn } from '@/lib/utils';
import { createColumnHelper } from '@tanstack/react-table';
import BigNumber from 'bignumber.js';
import { AlertCircle, AlertTriangle, CheckCircle, PauseCircle, PlayCircle } from 'lucide-react';
import type { StableCoinList } from './data';

const columnHelper = createColumnHelper<StableCoinList>();

export const columns = [
  ...createBaseColumns(columnHelper),
  columnHelper.accessor((row) => row.collateral, {
    id: 'collateral',
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
  createPausedColumn(columnHelper),
  createActionsColumn(columnHelper, assetConfig.stablecoin),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
  dangerCollateral: AlertTriangle,
  warningCollateral: AlertCircle,
  okCollateral: CheckCircle,
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
