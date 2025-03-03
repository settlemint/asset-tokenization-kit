"use client";

import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { getEquityList } from "@/lib/queries/equity/equity-list";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { Lock, PauseCircle, PlayCircle, Unlock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getEquityList>>[number]>();

export const icons: Record<string, ComponentType<{ className?: string }>> = {
  active: PlayCircle,
  paused: PauseCircle,
  private: Lock,
  public: Unlock,
};

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("admin.equities.table");

  return [
    columnHelper.accessor("id", {
      header: t("address-header"),
      cell: ({ getValue }) => (
        <EvmAddress address={getValue()} prettyNames={false}>
          <EvmAddressBalances address={getValue()} />
        </EvmAddress>
      ),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("name", {
      header: t("name-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("symbol", {
      header: t("symbol-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("totalSupply", {
      header: t("total-supply-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue }) => formatNumber(getValue()),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("equityCategory", {
      header: t("category-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("equityClass", {
      header: t("class-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("paused", {
      header: t("status-header"),
      cell: ({ getValue }) => {
        const paused: boolean = getValue();
        const Icon = icons[paused ? "paused" : "active"];
        return (
          <>
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <span>{paused ? t("paused-status") : t("active-status")}</span>
          </>
        );
      },
    }),
    columnHelper.accessor("private", {
      header: t("private-header"),
      cell: ({ getValue }) => {
        const privateAsset: boolean = !!getValue();
        const Icon = icons[privateAsset ? "private" : "public"];
        return (
          <>
            {Icon && <Icon className="size-4 text-muted-foreground" />}
            <span>
              {privateAsset ? t("private-status") : t("public-status")}
            </span>
          </>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: t("actions-header"),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/admin/equities/${row.original.id}`}
          />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
