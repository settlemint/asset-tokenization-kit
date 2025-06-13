"use client";

import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import type { UserAirdrop } from "@/lib/queries/airdrop/user-airdrop-schema";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { AirdropStatusIndicator } from "../airdrop-claim-status/airdrop-claim-status";
import { AirdropTypeIndicator } from "../airdrop-type-indicator/airdrop-type-indicator";

const columnHelper = createColumnHelper<UserAirdrop>();

export function Columns() {
  const t = useTranslations("portfolio.my-airdrops");
  const locale = useLocale();

  return [
    columnHelper.accessor("id", {
      header: t("table.airdrop-header"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
    }),
    columnHelper.display({
      header: t("table.asset-header"),
      cell: ({ row }) => <EvmAddress address={row.original.asset.id} />,
    }),
    columnHelper.display({
      header: t("table.type-header"),
      cell: ({ row }) => <AirdropTypeIndicator type={row.original.type} />,
    }),
    columnHelper.display({
      header: t("table.amount-header"),
      cell: ({ row }) =>
        formatNumber(row.original.recipient.totalAmountAllocated, {
          token: row.original.asset.symbol,
          locale: locale,
          decimals: row.original.asset.decimals,
        }),
    }),
    columnHelper.display({
      header: t("table.status-header"),
      cell: ({ row }) => (
        <AirdropStatusIndicator
          status={row.original.status}
          type={row.original.type}
        />
      ),
    }),
    columnHelper.display({
      id: "details",
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/portfolio/my-airdrops/${row.original.type}/${row.original.id}`}
          />
        );
      },
    }),
  ];
}
