"use client";

import type { User } from "@/lib/auth/types";
import type { AirdropClaimIndex } from "@/lib/queries/airdrop/airdrop-schema";
import type { UserStandardAirdrop } from "@/lib/queries/standard-airdrop/standard-airdrop-schema";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { CheckCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ClaimForm } from "../../manage-dropdown/claim-form/form";
import { StandardAirdropSummaryConfigurationCard } from "./airdrop-summary-card";

const columnHelper = createColumnHelper<AirdropClaimIndex>();

export function Columns({
  airdropDetail,
  user,
}: {
  airdropDetail: UserStandardAirdrop;
  user: User;
}) {
  const t = useTranslations("portfolio.my-airdrops");
  const locale = useLocale();
  const { asset, recipient, id: airdrop, type: airdropType } = airdropDetail;
  const { symbol, decimals } = asset;
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
          return (
            <div className="flex items-center gap-2">
              <CheckCircle className={cn("size-4 text-success")} />
              {t("table.claimed")}
            </div>
          );
        }

        return (
          <ClaimForm
            disabled={airdropDetail.status !== "ACTIVE"}
            address={airdrop}
            index={row.original.index}
            amount={row.original.amount}
            amountExact={row.original.amountExact}
            recipient={user.wallet}
            airdropType={airdropType}
            configurationCard={
              <StandardAirdropSummaryConfigurationCard
                asset={asset.id}
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
