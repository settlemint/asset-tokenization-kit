"use client";
import { formatDate } from "@/lib/utils/date";
import { isAfter, isBefore } from "date-fns";
import { useTranslations } from "next-intl";
import type { StandardAirdropRecipient } from "../airdrop/airdrop-recipient-schema";
import type { AirdropClaimStatus } from "../airdrop/airdrop-schema";

export type StandardAirdropStatusResult = {
  status: AirdropClaimStatus;
  message: string;
};

/**
 * Calculates the status and tooltip message for a standard airdrop (server-side version)
 *
 * Note: This is for server-side usage. For client components, use the functions in
 * the airdrop-claim-status component directly.
 *
 * @param recipient - The airdrop recipient data
 * @returns Object containing status and translated message
 */
export function CalculateStandardAirdropStatus(
  airdrop: StandardAirdropRecipient
): StandardAirdropStatusResult {
  const t = useTranslations("portfolio.my-airdrops.tooltip");
  const currentTime = new Date();

  // Check if user has already claimed
  const hasClaimed = !!airdrop.claimData?.firstClaimedTimestamp;

  if (hasClaimed) {
    return {
      status: "CLAIMED",
      message: t("standard-airdrop.claimed"),
    };
  }

  if (isBefore(currentTime, airdrop.startTime)) {
    return {
      status: "PENDING",
      message: t("standard-airdrop.pending-with-start", {
        date: formatDate(airdrop.startTime),
      }),
    };
  }

  if (isAfter(currentTime, airdrop.endTime)) {
    return {
      status: "EXPIRED",
      message: t("standard-airdrop.expired", {
        date: formatDate(airdrop.endTime),
      }),
    };
  }

  return {
    status: "READY",
    message: t("standard-airdrop.ready-with-end", {
      date: formatDate(airdrop.endTime),
    }),
  };
}
