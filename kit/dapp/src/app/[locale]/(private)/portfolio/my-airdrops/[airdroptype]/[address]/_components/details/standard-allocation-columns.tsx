"use client";

import type { AirdropClaimIndex } from "@/lib/queries/airdrop/airdrop-schema";
import { formatNumber } from "@/lib/utils/number";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocale, useTranslations } from "next-intl";
import type { Address } from "viem";
import { ClaimForm } from "../manage-dropdown/claim-form/form";
import { StandardAirdropSummaryConfigurationCard } from "./standard-airdrop-summary-card";

const columnHelper = createColumnHelper<AirdropClaimIndex>();

export function Columns({
  decimals,
  symbol,
  airdrop,
  recipient,
  airdropType,
  asset,
}: {
  airdrop: Address;
  recipient: Address;
  asset: Address;
  airdropType: AirdropType;
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
        const claimed =
          row.original.claimedAmountExact &&
          row.original.claimedAmountExact >= row.original.amountExact;
        if (claimed) {
          return <div className="text-muted-foreground">Claimed</div>;
        }

        return (
          <ClaimForm
            address={airdrop}
            index={row.original.index}
            amount={row.original.amount}
            amountExact={row.original.amountExact}
            recipient={recipient}
            airdropType={airdropType}
            configurationCard={
              <StandardAirdropSummaryConfigurationCard
                asset={asset}
                amount={row.original.amount}
                decimals={decimals}
                symbol={symbol}
              />
            }
            asTableAction={true}
          />
        );
      },
    }),
  ];
}
