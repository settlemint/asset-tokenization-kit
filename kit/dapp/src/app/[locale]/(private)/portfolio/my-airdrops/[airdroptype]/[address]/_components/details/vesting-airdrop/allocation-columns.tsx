"use client";

import type { User } from "@/lib/auth/types";
import type { AirdropClaimIndex } from "@/lib/queries/airdrop/airdrop-schema";
import { calculateClaimableAmount } from "@/lib/queries/vesting-airdrop/vesting-airdrop-amount";
import type { UserVestingAirdrop } from "@/lib/queries/vesting-airdrop/vesting-airdrop-schema";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/number";
import { createColumnHelper } from "@tanstack/react-table";
import { isAfter } from "date-fns";
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
  const { asset, id: airdrop, type: airdropType } = airdropDetail;
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

        const isInitialized = !!row.original.initialized;
        const isPastDeadline = isAfter(
          new Date(),
          airdropDetail.claimPeriodEnd
        );

        // If not initialized and past deadline, show expired
        if (!isInitialized && isPastDeadline) {
          return <span className="text-muted-foreground">Expired</span>;
        }

        let isDisabled = false;

        // If initialized, check claimable amount
        if (isInitialized) {
          const { claimableAmountExact } = calculateClaimableAmount(
            row.original.amountExact,
            row.original.claimedAmountExact ?? 0n,
            airdropDetail.strategy.vestingDuration,
            row.original.initialized!
          );
          isDisabled = claimableAmountExact === 0n;
        }

        return (
          <ClaimForm
            disabled={isDisabled}
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
