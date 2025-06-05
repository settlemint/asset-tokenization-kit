"use client";

import { AirdropClaimStatusIndicator } from "@/components/blocks/airdrop-claim-status/airdrop-claim-status";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import type { UserAirdrop } from "@/lib/queries/airdrop/user-airdrop-schema";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { AirdropTypeIndicator } from "../airdrop-type-indicator/airdrop-type-indicator";

const columnHelper = createColumnHelper<UserAirdrop>();

export function Columns() {
  const t = useTranslations("portfolio.my-airdrops");
  const locale = useLocale();

  return [
    columnHelper.accessor("airdrop.id", {
      header: t("table.airdrop-header"),
      cell: ({ getValue }) => <EvmAddress address={getValue()} />,
    }),
    columnHelper.display({
      header: t("table.asset-header"),
      cell: ({ row }) => <EvmAddress address={row.original.airdrop.asset.id} />,
    }),
    columnHelper.display({
      header: t("table.type-header"),
      cell: ({ row }) => (
        <AirdropTypeIndicator type={row.original.airdrop.type} />
      ),
    }),
    columnHelper.display({
      header: t("table.amount-header"),
      cell: ({ row }) =>
        formatNumber(row.original.amount, {
          token: row.original.airdrop.asset.symbol,
          locale: locale,
          decimals: row.original.airdrop.asset.decimals,
        }),
    }),
    columnHelper.display({
      header: t("table.status-header"),
      cell: ({ row }) => (
        <AirdropClaimStatusIndicator airdrop={row.original.airdrop} />
      ),
    }),
    columnHelper.display({
      id: "details",
      cell: ({ row }) => {
        return (
          <DataTableRowActions
            detailUrl={`/portfolio/my-airdrops/${row.original.airdrop.id}`}
          />
        );
      },
    }),
  ];
}
