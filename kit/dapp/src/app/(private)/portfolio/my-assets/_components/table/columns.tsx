'use client';

import type { MyAsset } from '@/app/(private)/portfolio/my-assets/data';
import { DataTableColumnCell } from '@/components/blocks/data-table/data-table-column-cell';
import { DataTableColumnHeader } from '@/components/blocks/data-table/data-table-column-header';
import { DataTableRowActions } from '@/components/blocks/data-table/data-table-row-actions';
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
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
    enableColumnFilter: false,
  }),
  columnHelper.accessor('valueExact', {
    header: ({ column }) => <DataTableColumnHeader column={column}>Balance</DataTableColumnHeader>,
    cell: ({ renderValue }) => <DataTableColumnCell>{renderValue()}</DataTableColumnCell>,
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
