"use client";

import type { User } from "@/lib/auth/types";
import type { AirdropClaimIndex } from "@/lib/queries/airdrop/airdrop-schema";
import type { UserVestingAirdrop } from "@/lib/queries/vesting-airdrop/vesting-airdrop-schema";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { CheckCircle } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { ClaimForm } from "../../manage-dropdown/claim-form/form";
import { VestingAirdropSummaryConfigurationCard } from "./airdrop-summary-card";

const columnHelper = createColumnHelper<AirdropClaimIndex>();

export function Columns({
  airdropDetail,
  user,
}: {
  airdropDetail: UserVestingAirdrop;
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
        const shouldInitialize =
          airdropDetail.status !== "ACTIVE" && !row.original.initialized;
        console.log({ shouldInitialize, x: row.original });
        return (
          <ClaimForm
            disabled={
              airdropDetail.status === "ACTIVE" ? false : !shouldInitialize
            }
            address={airdrop}
            index={row.original.index}
            amount={row.original.amount}
            amountExact={row.original.amountExact}
            recipient={user.wallet}
            airdropType={airdropType}
            configurationCard={
              <VestingAirdropSummaryConfigurationCard
                asset={asset.id}
                amountExact={row.original.amountExact}
                claimedAmountExact={row.original.claimedAmountExact ?? 0n}
                decimals={decimals}
                symbol={symbol}
                cliffDuration={airdropDetail.strategy.cliffDuration}
                vestingDuration={airdropDetail.strategy.vestingDuration}
                vestingStart={row.original.initialized}
              />
            }
            asTableAction={true}
          />
        );
      },
    }),
  ];
}
