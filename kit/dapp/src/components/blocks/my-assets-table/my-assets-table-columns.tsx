"use client";

import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations } from "next-intl";

const columnHelper = createColumnHelper<UserAsset>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("portfolio.my-assets.table");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tAssetType = useTranslations("asset-type");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tStatus = useTranslations("components.active-pill");

  return [
    columnHelper.accessor("asset.name", {
      header: t("name-header"),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset.symbol", {
      header: t("symbol-header"),
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => tAssetType(row.asset.type), {
      id: t("type-header"),
      header: t("type-header"),
      enableColumnFilter: true,
    }),
    columnHelper.accessor("value", {
      header: t("balance-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), { token: row.original.asset.symbol }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor(
      (row) => (row.asset.paused ? tStatus("paused") : tStatus("active")),
      {
        id: t("status-header"),
        header: t("status-header"),
        cell: ({ row }) => {
          return <ActivePill paused={row.original.asset.paused} />;
        },
        enableColumnFilter: true,
      }
    ),
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
