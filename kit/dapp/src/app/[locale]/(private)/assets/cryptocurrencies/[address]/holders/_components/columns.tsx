"use client";

import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { getAssetBalanceList } from "@/lib/queries/asset-balance/asset-balance-list";
import { formatDate } from "@/lib/utils/date";
import { formatHolderType } from "@/lib/utils/format-holder-type";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { CheckCircle, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";
import { getAddress } from "viem";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getAssetBalanceList>>[number]>();

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  blocked: XCircle,
  unblocked: CheckCircle,
};

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("admin.cryptocurrencies.holders");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tHolderType = useTranslations("holder-type");

  return [
    columnHelper.accessor("account.id", {
      header: t("wallet-header"),
      cell: ({ getValue }) => {
        const wallet = getAddress(getValue());
        return (
          <EvmAddress address={wallet} copyToClipboard={true} verbose={true}>
            <EvmAddressBalances address={wallet} />
          </EvmAddress>
        );
      },
      enableColumnFilter: false,
    }),
    columnHelper.accessor("value", {
      header: t("balance-header"),
      cell: ({ getValue }) => formatNumber(getValue()),
      enableColumnFilter: false,
      meta: {
        variant: "numeric",
      },
    }),
    columnHelper.display({
      header: t("holder-type-header"),
      enableColumnFilter: false,
      cell: ({ row }) => formatHolderType(row.original, tHolderType),
    }),
    columnHelper.accessor("frozen", {
      header: t("frozen-header"),
      cell: ({ getValue }) => formatNumber(getValue()),
      enableColumnFilter: false,
      meta: {
        variant: "numeric",
      },
    }),
    columnHelper.accessor("blocked", {
      header: t("status-header"),
      cell: ({ getValue }) => {
        const blocked: boolean = getValue();
        const Icon = icons[blocked ? "blocked" : "unblocked"];
        return (
          <>
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <span>{blocked ? t("blocked-status") : t("active-status")}</span>
          </>
        );
      },
    }),
    columnHelper.accessor("account.lastActivity", {
      header: t("last-activity-header"),
      cell: ({ getValue }) => {
        const lastActivity = getValue();
        return lastActivity
          ? formatDate(lastActivity, { type: "distance" })
          : "-";
      },
      enableColumnFilter: false,
    }),
  ];
}
