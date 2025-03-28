"use client";

import { ActivePill } from "@/components/blocks/active-pill/active-pill";
import { ColumnAssetStatus } from "@/components/blocks/asset-info/column-asset-status";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import { EvmAddressBalances } from "@/components/blocks/evm-address/evm-address-balances";
import type { getBondList } from "@/lib/queries/bond/bond-list";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

const columnHelper =
  createColumnHelper<Awaited<ReturnType<typeof getBondList>>[number]>();

export function bondColumns() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("private.assets.fields");
  // eslint-disable-next-line react-hooks/rules-of-hooks
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
    columnHelper.accessor("price", {
      header: t("price-header"),
      cell: ({ getValue }) =>
        formatNumber(getValue().amount, {
          currency: getValue().currency,
          decimals: 2,
          locale: locale,
        }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor("totalSupply", {
      header: t("total-supply-header"),
      meta: {
        variant: "numeric",
      },
      cell: ({ getValue }) =>
        formatNumber(getValue(), {
          locale: locale,
        }),
      enableColumnFilter: false,
    }),
    columnHelper.accessor((row) => <ColumnAssetStatus assetOrBalance={row} />, {
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
          <DataTableRowActions detailUrl={`/assets/bond/${row.original.id}`} />
        );
      },
      meta: {
        enableCsvExport: false,
      },
    }),
  ];
}
