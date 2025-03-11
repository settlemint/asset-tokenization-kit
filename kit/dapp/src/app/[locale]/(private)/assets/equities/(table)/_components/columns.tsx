"use client";

import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { getEquityList } from "@/lib/queries/equity/equity-list";
import { formatAssetStatus } from "@/lib/utils/format-asset-status";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useTranslations, type MessageKeys } from "next-intl";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getEquityList>>[number]>();

export function columns() {
  // https://next-intl.dev/docs/environments/server-client-components#shared-components
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("admin.equities.table");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tAssetStatus = useTranslations("asset-status");

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
      cell: ({ getValue }) =>
        t(
          `category-${getValue().toLowerCase().replace(/_/g, "-")}` as MessageKeys<
            "admin.equities.table",
            "category-header"
          >
        ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor("equityClass", {
      header: t("class-header"),
      cell: ({ getValue }) =>
        t(
          `class-${getValue().toLowerCase().replace(/_/g, "-")}` as MessageKeys<
            "admin.equities.table",
            "class-header"
          >
        ),
      enableColumnFilter: true,
    }),
    columnHelper.accessor((row) => formatAssetStatus(row, tAssetStatus), {
      header: t("status-header"),
      cell: ({ row }) => {
        return <ActivePill paused={row.original.paused} />;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: t("actions-header"),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/assets/equities/${row.original.id}`}
          />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
