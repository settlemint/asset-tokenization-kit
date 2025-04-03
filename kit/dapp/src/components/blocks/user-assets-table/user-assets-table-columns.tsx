"use client";

import { AssetStatusPill } from "@/components/blocks/asset-status-pill/asset-status-pill";
import { defineMeta, filterFn } from "@/lib/filters";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { assetTypes } from "@/lib/utils/typebox/asset-types";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ActivityIcon,
  AsteriskIcon,
  ClockIcon,
  InfoIcon,
  ShapesIcon,
  WalletIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ColumnAssetStatus } from "../asset-info/column-asset-status";
import { ColumnAssetType } from "../asset-info/column-asset-type";
import { ColumnHolderType } from "../asset-info/column-holder-type";

const columnHelper = createColumnHelper<UserAsset>();

const HOLDER_TYPES_OPTIONS = [
  { label: "Owner", value: "owner" },
  { label: "Holder", value: "holder" },
];
const ASSET_STATUSES_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Blocked", value: "blocked" },
];

export function Columns() {
  const t = useTranslations("private.users.holdings.table");
  const tAssetType = useTranslations("asset-type");
  const tAssetStatus = useTranslations("asset-status");
  const locale = useLocale();

  const getHolderTypeString = (row: UserAsset): "owner" | "holder" => {
    return row.account.id === row.asset.creator.id ? "owner" : "holder";
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
      id: t("type-header"),
      header: t("type-header"),
      cell: ({ getValue }) => {
        return <ColumnAssetType assettype={getValue()} />;
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.asset.type, {
        displayName: t("type-header"),
        icon: ShapesIcon,
        type: "option",
        options: assetTypes.map((type: string) => ({
          label: tAssetType(type as any),
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
    columnHelper.accessor(getHolderTypeString, {
      id: t("holder-type-header"),
      header: t("holder-type-header"),
      cell: ({ row }) => {
        return <ColumnHolderType assetBalance={row.original} />;
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta(getHolderTypeString, {
        displayName: t("holder-type-header"),
        icon: InfoIcon,
        type: "option",
        options: HOLDER_TYPES_OPTIONS,
      }),
    }),
    columnHelper.accessor((row) => ColumnAssetStatus({ assetOrBalance: row }), {
      id: t("status-header"),
      header: t("status-header"),
      cell: ({ row }) => {
        return <AssetStatusPill assetBalance={row.original} />;
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => ColumnAssetStatus({ assetOrBalance: row }), {
        displayName: t("status-header"),
        icon: ActivityIcon,
        type: "option",
        options: ASSET_STATUSES_OPTIONS.map((status) => ({
          label: tAssetStatus(status.value as any),
          value: status.value,
        })),
      }),
    }),
    columnHelper.accessor("lastActivity", {
      header: t("last-activity-header"),
      cell: ({ getValue }) => {
        const lastActivity = getValue();
        return lastActivity
          ? formatDate(lastActivity, { type: "distance", locale: locale })
          : "-";
      },
      enableColumnFilter: true,
      filterFn: filterFn("date"),
      meta: defineMeta((row) => row.lastActivity, {
        displayName: t("last-activity-header"),
        icon: ClockIcon,
        type: "date",
      }),
    }),
  ];
}
