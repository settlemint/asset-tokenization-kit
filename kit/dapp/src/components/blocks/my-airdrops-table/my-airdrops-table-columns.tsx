"use client";

import { AirdropClaimStatusIndicator } from "@/components/blocks/airdrop-claim-status/airdrop-claim-status";
import { DataTableRowActions } from "@/components/blocks/data-table/data-table-row-actions";
import { EvmAddress } from "@/components/blocks/evm-address/evm-address";
import type { AirdropRecipient } from "@/lib/queries/airdrop/airdrop-recipient-schema";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import { AirdropTypeIndicator } from "../airdrop-type-indicator/airdrop-type-indicator";

const columnHelper = createColumnHelper<AirdropRecipient>();

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
          adjustDecimals: true,
        }),
    }),
    columnHelper.display({
      header: t("table.status-header"),
      cell: ({ row }) => (
        <AirdropClaimStatusIndicator airdropRecipient={row.original} />
      ),
    }),
    columnHelper.display({
      id: "details",
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
