"use client";

import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import { PercentageProgressBar } from "@/components/blocks/percentage-progress/percentage-progress";
import { defineMeta, filterFn } from "@/lib/filters";
import type { getStableCoinList } from "@/lib/queries/stablecoin/stablecoin-list";
import { formatNumber } from "@/lib/utils/number";
import type { CellContext } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import {
  ActivityIcon,
  AsteriskIcon,
  CoinsIcon,
  DollarSignIcon,
  MoreHorizontal,
  PercentIcon,
  WalletIcon,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type Stablecoin = Awaited<ReturnType<typeof getStableCoinList>>[number];

const columnHelper = createColumnHelper<Stablecoin>();

const ASSET_STATUSES_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Paused", value: "paused" },
];

export function stablecoinColumns() {
  const t = useTranslations("private.assets.fields");
  const tAssetStatus = useTranslations("asset-status");
  const locale = useLocale();

  return [
    columnHelper.accessor("id", {
      header: t("address-header"),
      cell: ({ getValue }) => (
        <EvmAddress address={getValue()} prettyNames={false}>
          <EvmAddressBalances address={getValue()} />
        </EvmAddress>
      ),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.id, {
        displayName: t("address-header"),
        icon: WalletIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("name", {
      header: t("name-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.name, {
        displayName: t("name-header"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor("symbol", {
      header: t("symbol-header"),
      cell: ({ getValue }) => getValue(),
      enableColumnFilter: true,
      filterFn: filterFn("text"),
      meta: defineMeta((row) => row.symbol, {
        displayName: t("symbol-header"),
        icon: AsteriskIcon,
        type: "text",
      }),
    }),
    columnHelper.accessor((row) => row.price.amount, {
      header: t("price-header"),
      cell: ({ row }) =>
        formatNumber(row.original.price.amount, {
          currency: row.original.price.currency,
          decimals: 2,
          locale: locale,
        }),
      enableColumnFilter: false,
      meta: defineMeta((row) => row.price.amount, {
        displayName: t("price-header"),
        icon: DollarSignIcon,
        type: "number",
      }),
    }),
    columnHelper.accessor("totalSupply", {
      header: t("total-supply-header"),
      cell: ({ getValue }) => formatNumber(getValue(), { locale }),
      enableColumnFilter: true,
      filterFn: filterFn("number"),
      meta: defineMeta((row) => Number(row.totalSupply), {
        displayName: t("total-supply-header"),
        icon: CoinsIcon,
        type: "number",
        variant: "numeric",
      }),
    }),
    columnHelper.accessor("collateralRatio", {
      header: t("committed-collateral-header"),
      cell: ({ getValue }) => {
        return <PercentageProgressBar percentage={getValue()} />;
      },
      enableColumnFilter: true,
      filterFn: filterFn("number"),
      meta: defineMeta((row) => row.collateralRatio, {
        displayName: t("committed-collateral-header"),
        icon: PercentIcon,
        type: "number",
      }),
    }),
    columnHelper.accessor((row) => (row.paused ? "paused" : "active"), {
      header: t("status-header"),
      cell: ({ row }) => {
        return <ActivePill paused={row.original.paused} />;
      },
      enableColumnFilter: true,
      filterFn: filterFn("option"),
      meta: defineMeta((row) => (row.paused ? "paused" : "active"), {
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
      cell: ({ row }: CellContext<Stablecoin, unknown>) => {
        return (
          <DataTableRowActions
            detailUrl={`/assets/stablecoin/${row.original.id}`}
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
