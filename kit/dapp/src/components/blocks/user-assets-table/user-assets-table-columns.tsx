"use client";

import { AssetStatusPill } from "@/components/blocks/asset-status-pill/asset-status-pill";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { ColumnAssetStatus } from "../asset-info/column-asset-status";
import { ColumnAssetType } from "../asset-info/column-asset-type";
import { ColumnHolderType } from "../asset-info/column-holder-type";

const columnHelper = createColumnHelper<UserAsset>();

export function columns() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("private.users.holdings.table");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const locale = useLocale();

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
      id: t("type-header"),
      header: t("type-header"),
      cell: ({ getValue }) => {
        return <ColumnAssetType assettype={getValue()} />;
      },
    }),
    columnHelper.accessor("value", {
      header: t("balance-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), {
          token: row.original.asset.symbol,
          locale: locale,
        }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("asset", {
      id: t("holder-type-header"),
      header: t("holder-type-header"),
      cell: ({ row }) => {
        return <ColumnHolderType assetBalance={row.original} />;
      },
    }),
    columnHelper.accessor((row) => <ColumnAssetStatus assetOrBalance={row} />, {
      id: t("status-header"),
      header: t("status-header"),
      cell: ({ row }) => {
        return <AssetStatusPill assetBalance={row.original} />;
      },
    }),
    columnHelper.accessor("lastActivity", {
      header: t("last-activity-header"),
      cell: ({ getValue }) => {
        const lastActivity = getValue();
        return lastActivity
          ? formatDate(lastActivity, { type: "distance", locale: locale })
          : "-";
      },
      enableColumnFilter: false,
    }),
  ];
}
