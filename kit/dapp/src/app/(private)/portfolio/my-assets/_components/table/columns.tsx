'use client';

import type { MyAsset } from '@/app/(private)/portfolio/my-assets/data';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
import { Badge } from '@/components/ui/badge';
import { formatNumber } from '@/lib/number';
import { formatAssetType } from '@/lib/utils/format-asset-type';
import { createColumnHelper } from '@tanstack/react-table';

const columnHelper = createColumnHelper<MyAsset>();

export const columns = [
  columnHelper.accessor('asset.name', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>,
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('asset.symbol', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>,
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('asset.type', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Type</DataTableColumnHeader>,
    cell: ({ getValue }) => <DataTableColumnCell>{formatAssetType(getValue() as string)}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('value', {
    header: ({ column }) => (
      <DataTableColumnHeader column={column} variant="numeric">
        Balance
      </DataTableColumnHeader>
    ),
    cell: ({ getValue }) => (
      <DataTableColumnCell variant="numeric">{formatNumber(getValue() as string)}</DataTableColumnCell>
    ),
    enableColumnFilter: false,
  }),
  columnHelper.accessor('asset.paused', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>,
    cell: ({ getValue }) => {
      const value = getValue() as boolean;
      if (value === true) {
        return (
          <DataTableColumnCell>
            <Badge className="pointer-events-none bg-yellow-500 text-white">Paused</Badge>
          </DataTableColumnCell>
        );
      }
      if (value === false) {
        return (
          <DataTableColumnCell>
            <Badge className="pointer-events-none bg-green-600 text-white">Active</Badge>
          </DataTableColumnCell>
        );
      }
      return null;
    },
    enableColumnFilter: false,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => 'Action',
    cell: ({ row }) => {
      return <DataTableRowActions detailUrl={`/portfolio/my-assets/${row.original.asset.id}`} />;
    },
    meta: {
      enableCsvExport: false,
    },
  }),
];
