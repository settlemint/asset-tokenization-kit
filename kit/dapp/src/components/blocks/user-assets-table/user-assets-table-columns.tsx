"use client";

import { BlockForm } from "@/app/[locale]/(private)/assets/[assettype]/[address]/_components/block-form/form";
import { MintForm } from "@/app/[locale]/(private)/assets/[assettype]/[address]/_components/mint-form/form";
import { FreezeForm } from "@/app/[locale]/(private)/assets/[assettype]/[address]/holders/_components/actions/freeze-form/form";
import { AssetStatusPill } from "@/components/blocks/asset-status-pill/asset-status-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { defineMeta, filterFn } from "@/lib/filters";
import type { AssetBalance } from "@/lib/queries/asset-balance/asset-balance-schema";
import type { UserAsset } from "@/lib/queries/asset-balance/asset-balance-user";
import { formatDate } from "@/lib/utils/date";
import {
  hasAllowlist,
  hasBlocklist,
  hasFreeze,
} from "@/lib/utils/features-enabled";
import { formatNumber } from "@/lib/utils/number";
import { assetTypes } from "@/lib/utils/typebox/asset-types";
import { type ColumnMeta, createColumnHelper } from "@tanstack/react-table";
import {
  ActivityIcon,
  AsteriskIcon,
  ClockIcon,
  InfoIcon,
  MoreHorizontal,
  ShapesIcon,
  WalletIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
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
  const t = useTranslations("private.users.holdings.table");
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
            actions={[
              {
                id: "block-form",
                label: t("trigger-label.block"),
                component: ({ open, onOpenChange }) => (
                  <BlockForm
                    address={row.original.asset.id}
                    assettype={row.original.asset.type}
                    userAddress={row.original.account.id}
                    open={open}
                    onOpenChange={onOpenChange}
                  />
                ),
                disabled: row.original.asset.paused,
                hidden: !hasBlocklist(row.original.asset.type),
              },
              {
                id: "freeze-form",
                label: t("trigger-label.freeze"),
                component: ({ open, onOpenChange }) => (
                  <FreezeForm
                    address={row.original.asset.id}
                    userAddress={row.original.account.id}
                    balance={row.original.value}
                    symbol={row.original.asset.symbol}
                    assettype={row.original.asset.type}
                    decimals={row.original.asset.decimals}
                    open={open}
                    onOpenChange={onOpenChange}
                  />
                ),
                disabled: row.original.asset.paused || row.original.value === 0,
                hidden: !hasFreeze(row.original.asset.type),
              },
              {
                id: "mint-form",
                label: t("trigger-label.mint"),
                component: ({ open, onOpenChange }) => (
                  <MintForm
                    address={row.original.asset.id}
                    recipient={row.original.account.id}
                    assettype={row.original.asset.type}
                    open={open}
                    onOpenChange={onOpenChange}
                    max={row.original.asset.totalSupply}
                    decimals={row.original.asset.decimals}
                    symbol={row.original.asset.symbol}
                    allowlist={row.original.asset.allowlist ?? []}
                  />
                ),
                disabled:
                  row.original.asset.paused ||
                  row.original.asset.totalSupply === 0 ||
                  (hasAllowlist(row.original.asset.type) &&
                    !row.original.asset.allowlist?.some(
                      (allowlist) =>
                        allowlist.user.id === row.original.account.id
                    )),
              },
            ]}
          />
        );
      },
      meta: {
        displayName: t("actions-header"),
        icon: MoreHorizontal,
        type: "text",
        enableCsvExport: false,
      } as ColumnMeta<AssetBalance, unknown>,
    }),
  ];
}
