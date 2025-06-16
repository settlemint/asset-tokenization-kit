"use client";

import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { formatNumber } from "@/lib/utils/number";
import type { ColumnMeta } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { CoinsIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ColumnAssetType } from "../asset-info/column-asset-type";

const columnHelper = createColumnHelper<UserAsset>();

export function ColumnsSmall() {
  const t = useTranslations("portfolio.my-assets.table");
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
        displayName: t("balance-header"),
        icon: CoinsIcon,
        type: "number",
        variant: "numeric",
      } as ColumnMeta<UserAsset, number>,
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), {
          token: row.original.asset.symbol,
          locale: locale,
        }),
      enableColumnFilter: false,
    }),
  ];
}
