"use client";

import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { defineMeta } from "@/lib/filters";
import type { getCryptoCurrencyList } from "@/lib/queries/cryptocurrency/cryptocurrency-list";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import {
  AsteriskIcon,
  CoinsIcon,
  DollarSignIcon,
  MoreHorizontal,
  WalletIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const columnHelper =
  createColumnHelper<
    Awaited<ReturnType<typeof getCryptoCurrencyList>>[number]
  >();

export function CryptocurrencyColumns() {
  const t = useTranslations("private.assets.fields");
  const locale = useLocale();

  return [
    columnHelper.accessor("id", {
      header: t("address-header"),
      cell: ({ getValue }) => (
        <EvmAddress address={getValue()} prettyNames={false}>
          <EvmAddressBalances address={getValue()} />
        </EvmAddress>
      ),
      enableColumnFilter: false,
      meta: defineMeta((row) => row.id, {
        displayName: t("address-header"),
        icon: WalletIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("name", {
      header: t("name-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: false,
      meta: defineMeta((row) => row.name, {
        displayName: t("name-header"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("symbol", {
      header: t("symbol-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: false,
      meta: defineMeta((row) => row.symbol, {
        displayName: t("symbol-header"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("price", {
      header: t("price-header"),
      cell: ({ getValue }) =>
        formatNumber(getValue().amount, {
          currency: getValue().currency,
          decimals: 2,
          locale: locale,
        }),
      enableColumnFilter: false,
      meta: {
        displayName: t("price-header"),
        icon: DollarSignIcon,
        type: "number",
      },
    }),
    columnHelper.accessor("totalSupply", {
      header: t("total-supply-header"),
      meta: defineMeta((row) => Number(row.totalSupply), {
        displayName: t("total-supply-header"),
        icon: CoinsIcon,
        type: "number",
        variant: "numeric",
      }),
      cell: ({ getValue }) => formatNumber(getValue(), { locale }),
      enableColumnFilter: false,
    }),
    columnHelper.display({
      id: "actions",
      header: t("actions-header"),
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/assets/cryptocurrency/${row.original.id}`}
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
