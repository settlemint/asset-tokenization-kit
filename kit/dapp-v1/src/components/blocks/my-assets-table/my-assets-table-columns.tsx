"use client";

import { AssetStatusPill } from "@/components/blocks/asset-status-pill/asset-status-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { defineMeta, filterFn } from "@/lib/filters";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { formatNumber } from "@/lib/utils/number";
import { assetTypes } from "@/lib/utils/typebox/asset-types";
import type { ColumnMeta } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ActivityIcon,
  AsteriskIcon,
  MoreHorizontal,
  ShapesIcon,
  WalletIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ColumnAssetType } from "../asset-info/column-asset-type";

const columnHelper = createColumnHelper<UserAsset>();

const ASSET_STATUSES_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Blocked", value: "blocked" },
];

// Extract status value without using hooks
function getAssetStatus(assetOrBalance: UserAsset): string {
  if (assetOrBalance.blocked) {
    return "blocked";
  }
  if (assetOrBalance.asset.paused) {
    return "paused";
  }
  return "active";
}

export function Columns() {
  const t = useTranslations("portfolio.my-assets.table");
  const tAssetType = useTranslations("asset-type");
  const tAssetStatus = useTranslations("asset-status");
  const locale = useLocale();

  // Helper function to get the correct translation key for each asset type
  const getAssetTypeLabel = (type: string) => {
    switch (type) {
      case "bond":
        return tAssetType("bonds");
      case "cryptocurrency":
        return tAssetType("cryptocurrencies");
      case "stablecoin":
        return tAssetType("stablecoins");
      case "deposit":
        return tAssetType("deposits");
      case "equity":
        return tAssetType("equities");
      case "fund":
        return tAssetType("funds");
      default:
        return tAssetType("unknown");
    }
  };

  return [
    columnHelper.accessor("asset.name", {
      header: t("name-header"),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.asset.name, {
        displayName: t("name-header"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("asset.symbol", {
      header: t("symbol-header"),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.asset.symbol, {
        displayName: t("symbol-header"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("asset.type", {
      header: t("type-header"),
      cell: ({ getValue }) => <ColumnAssetType assettype={getValue()} />,
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.asset.type, {
        displayName: t("type-header"),
        icon: ShapesIcon,
        type: "option",
        options: assetTypes.map((type: string) => ({
          label: getAssetTypeLabel(type),
          value: type,
        })),
      }),
    }),
    columnHelper.accessor("value", {
      header: t("balance-header"),
      meta: defineMeta((row) => Number(row.value), {
        displayName: t("balance-header"),
        icon: WalletIcon,
        type: "number",
        variant: "numeric",
      }),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), {
          token: row.original.asset.symbol,
          locale: locale,
        }),
      enableColumnFilter: true,
      filterFn: filterFn("number"),
    }),
    columnHelper.accessor(getAssetStatus, {
      id: t("status-header"),
      header: t("status-header"),
      cell: ({ row }) => {
        // Use the component only in the cell renderer
        return <AssetStatusPill assetBalance={row.original} />;
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta(getAssetStatus, {
        displayName: t("status-header"),
        icon: ActivityIcon,
        type: "option",
        options: ASSET_STATUSES_OPTIONS.map((status) => ({
          label: tAssetStatus(status.value as any),
          value: status.value,
        })),
      }),
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
        displayName: t("actions-header"),
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      } as ColumnMeta<UserAsset, unknown>,
    }),
  ];
}
