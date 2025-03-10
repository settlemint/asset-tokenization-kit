"use client";

import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { formatAssetType } from "@/lib/utils/format-asset-type";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

const columnHelper = createColumnHelper<UserAsset>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("admin.users.holdings.table");

  return [
    columnHelper.accessor("asset.name", {
      header: t("name-header"),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset.symbol", {
      header: t("symbol-header"),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset.type", {
      header: t("type-header"),
      cell: ({ getValue }) => formatAssetType(getValue()),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("value", {
      header: t("balance-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), {
          currency: row.original.asset.symbol,
        }),
      enableColumnFilter: false,
    }),
    columnHelper.display({
      header: t("role-header"),
      enableColumnFilter: false,
      cell: ({ row }) => {
        if (row.original.asset.creator.id === row.original.account.id) {
          return <div>Creator</div>;
        }
        if (
          row.original.asset.admins.some(
            (admin) => admin.id === row.original.account.id
          )
        ) {
          return <div>Admin</div>;
        }
        if (
          row.original.asset.supplyManagers.some(
            (manager) => manager.id === row.original.account.id
          )
        ) {
          return <div>Supply Manager</div>;
        }
        return <div>Regular Holder</div>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: t("actions-header"),
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
