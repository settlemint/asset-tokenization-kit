"use client";

import { ColumnAssetStatus } from "@/components/blocks/asset-info/column-asset-status";
import { AssetStatusPill } from "@/components/blocks/asset-status-pill/asset-status-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { defineMeta, filterFn } from "@/lib/filters";
import type { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { formatDate } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ActivityIcon,
  ClockIcon,
  CoinsIcon,
  MoreHorizontal,
  WalletIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { getAddress } from "viem";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getAssetBalanceList>>[number]>();

const ASSET_STATUSES_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
  { label: "Blocked", value: "blocked" },
];

export function Columns() {
  const t = useTranslations("private.assets.fields");
  const tAssetStatus = useTranslations("asset-status");
  const locale = useLocale();

  return [
    columnHelper.accessor("asset.id", {
      header: t("wallet-header"),
      cell: ({ getValue }) => {
        const wallet = getAddress(getValue());
        return (
          <EvmAddress address={wallet} copyToClipboard={true} verbose={true}>
            <EvmAddressBalances address={wallet} />
          </EvmAddress>
        );
      },
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.asset.id, {
        displayName: t("wallet-header"),
        icon: WalletIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("value", {
      header: t("balance-header"),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), {
          token: row.original.asset.symbol,
          locale: locale,
        }),
      enableColumnFilter: true,
      filterFn: filterFn("number"),
      meta: defineMeta((row) => Number(row.value), {
        displayName: t("balance-header"),
        icon: CoinsIcon,
        type: "number",
        variant: "numeric",
      }),
    }),
    columnHelper.accessor("frozen", {
      header: t("frozen-header"),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), {
          token: row.original.asset.symbol,
          locale: locale,
        }),
      enableColumnFilter: true,
      filterFn: filterFn("number"),
      meta: defineMeta((row) => Number(row.frozen), {
        displayName: t("frozen-header"),
        icon: CoinsIcon,
        type: "number",
        variant: "numeric",
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
    columnHelper.display({
      id: "actions",
      header: t("actions-header"),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/assets/${row.original.asset.type}/${row.original.asset.id}`}
          />
        );
      },
      meta: {
        displayName: t("actions-header"),
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      } as any,
    }),
  ];
}
