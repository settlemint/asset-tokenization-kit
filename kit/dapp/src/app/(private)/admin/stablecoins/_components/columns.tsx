'use client';

import {
  createActionsColumn,
  createBaseColumns,
  createPausedColumn,
} from '@/components/blocks/asset-table/asset-table-columns';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { formatPercentage } from '@/lib/number';
import { cn } from '@/lib/utils';
import { createColumnHelper } from '@tanstack/react-table';
import { AlertCircle, AlertTriangle, CheckCircle, PauseCircle, PlayCircle } from 'lucide-react';
import type { StableCoinAsset } from './data';

const columnHelper = createColumnHelper<StableCoinAsset>();

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
      const totalSupply = Number.parseFloat(row.getValue<string>('totalSupply'));
      const collateral = Number.parseFloat(getValue());
      const { Icon, color } = getCollateralStatus(totalSupply, collateral);
      return (
        <DataTableColumnCell variant="numeric">
          <div className={cn('flex items-center gap-2', color)}>
            <Icon className="h-4 w-4" />
            <span>{formatPercentage(totalSupply === 0 ? 100 : (collateral / totalSupply) * 100)}</span>
          </div>
        </DataTableColumnCell>
      );
    },
    enableColumnFilter: false,
  }),
  createPausedColumn(columnHelper),
  createActionsColumn(columnHelper, 'stablecoins'),
];

export const icons = {
  active: PlayCircle,
  paused: PauseCircle,
  dangerCollateral: AlertTriangle,
  warningCollateral: AlertCircle,
  okCollateral: CheckCircle,
};

const getCollateralStatus = (totalSupply: number, collateral: number) => {
  if (totalSupply === 0) {
    return { status: 'ok', Icon: icons.okCollateral };
  }
  const ratio = (collateral / totalSupply) * 100;
  if (ratio > 90) {
    return { status: 'ok', Icon: icons.okCollateral };
  }
  if (ratio > 70) {
    return { status: 'warning', Icon: icons.warningCollateral, color: 'text-warning' };
  }
  return { status: 'danger', Icon: icons.dangerCollateral, color: 'text-destructive' };
};
