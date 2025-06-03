"use client";

import { AirdropTypeIcon } from "@/components/blocks/airdrop-type-icon/airdrop-type-icon";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { defineMeta, filterFn } from "@/lib/filters";
import type { AirdropRecipient } from "@/lib/queries/airdrop/airdrop-recipient-schema";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { formatNumber } from "@/lib/utils/number";
import { AirdropType, airdropTypes } from "@/lib/utils/typebox/airdrop-types";
import { createColumnHelper } from "@tanstack/react-table";
import { ActivityIcon, AsteriskIcon, ShapesIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const columnHelper = createColumnHelper<AirdropRecipient>();

const CLAIM_STATUS_OPTIONS = [
  { label: "Available", value: "available" },
  { label: "Claimed", value: "claimed" },
] as const;

function getClaimStatus(airdropRecipient: AirdropRecipient) {
  return airdropRecipient.claimed ? "claimed" : "available";
}

export function Columns() {
  const t = useTranslations("portfolio.my-airdrops");
  const locale = useLocale();

  // Helper function to get the correct translation key for each airdrop type
  const getAirdropTypeLabel = (type: AirdropType) => {
    switch (type) {
      case "standard":
        return t("airdrop-type.standard");
      case "vesting":
        return t("airdrop-type.vesting");
      case "push":
        return t("airdrop-type.push");
      default:
        exhaustiveGuard(type);
    }
  };

  return [
    columnHelper.accessor("airdrop.asset.symbol", {
      header: t("table.asset-header"),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.airdrop.asset.symbol, {
        displayName: t("table.asset-header"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("airdrop.type", {
      header: t("table.type-header"),
      cell: ({ getValue }) => <AirdropTypeIcon type={getValue()} />,
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => row.airdrop.type, {
        displayName: t("table.type-header"),
        icon: ShapesIcon,
        type: "option",
        options: airdropTypes.map((type) => ({
          label: getAirdropTypeLabel(type),
          value: type,
        })),
      }),
    }),
    columnHelper.accessor("amount", {
      header: t("table.amount-header"),
      cell: ({ getValue, row }) =>
        formatNumber(getValue(), {
          token: row.original.airdrop.asset.symbol,
          locale: locale,
          decimals: row.original.airdrop.asset.decimals,
        }),
    }),
    columnHelper.accessor(getClaimStatus, {
      id: t("table.status-header"),
      header: t("table.status-header"),
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              status === "claimed"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {t(`claim-status.${status}`)}
          </span>
        );
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta(getClaimStatus, {
        displayName: t("table.status-header"),
        icon: ActivityIcon,
        type: "option",
        options: CLAIM_STATUS_OPTIONS.map((status) => ({
          label: t(`claim-status.${status.value}`),
          value: status.value,
        })),
      }),
    }),
    columnHelper.display({
      id: "actions",
      header: t("table.actions-header"),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/portfolio/my-airdrops/${row.original.airdrop.type}/${row.original.airdrop.id}`}
          />
        );
      },
    }),
  ];
}
