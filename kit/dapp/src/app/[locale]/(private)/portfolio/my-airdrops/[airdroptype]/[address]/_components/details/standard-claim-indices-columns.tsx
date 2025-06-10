"use client";

import type { AirdropClaimIndex } from "@/lib/queries/airdrop/airdrop-schema";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";

const columnHelper = createColumnHelper<AirdropClaimIndex>();

export function Columns({
  decimals,
  symbol,
}: {
  decimals: number;
  symbol: string;
}) {
  const t = useTranslations("portfolio.my-airdrops");
  const locale = useLocale();

  return [
    columnHelper.display({
      header: t("table.amount-allocated-header"),
      cell: ({ row }) =>
        formatNumber(row.original.amount, {
          token: symbol,
          locale: locale,
          decimals: decimals,
        }),
    }),
    columnHelper.display({
      header: t("table.amount-claimed-header"),
      cell: ({ row }) =>
        row.original.claimedAmount
          ? formatNumber(row.original.claimedAmount, {
              token: symbol,
              locale: locale,
              decimals: decimals,
            })
          : "-",
    }),
    columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        return <></>;
      },
    }),
  ];
}
