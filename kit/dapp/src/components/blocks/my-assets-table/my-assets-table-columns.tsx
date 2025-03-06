"use client";

import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { DataTableColumnCell } from "@/components/blocks/data-table/data-table-column-cell";
import { DataTableColumnHeader } from "@/components/blocks/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import type { MyAsset } from "@/lib/queries/asset-balance/asset-balance-my";
import { formatAssetType } from "@/lib/utils/format-asset-type";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";

const columnHelper = createColumnHelper<MyAsset>();

export function columns() {
  return [
    columnHelper.accessor("asset.name", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>Name</DataTableColumnHeader>
      ),
      cell: ({ renderValue }) => (
        <DataTableColumnCell>{renderValue()}</DataTableColumnCell>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset.symbol", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>Symbol</DataTableColumnHeader>
      ),
      cell: ({ renderValue }) => (
        <DataTableColumnCell>{renderValue()}</DataTableColumnCell>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset.type", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>Type</DataTableColumnHeader>
      ),
      cell: ({ getValue }) => (
        <DataTableColumnCell>{formatAssetType(getValue())}</DataTableColumnCell>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("value", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column} variant="numeric">
          Balance
        </DataTableColumnHeader>
      ),
      cell: ({ getValue }) => (
        <DataTableColumnCell variant="numeric">
          {formatNumber(getValue())}
        </DataTableColumnCell>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset.paused", {
      header: ({ column }) => (
        <DataTableColumnHeader column={column}>Status</DataTableColumnHeader>
      ),
      cell: ({ getValue }) => {
        const value = getValue();
        return <ActivePill paused={value} />;
      },
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: "actions",
      header: () => "Action",
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/portfolio/my-assets/${row.original.asset.type}/${row.original.asset.id}`}
          />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
