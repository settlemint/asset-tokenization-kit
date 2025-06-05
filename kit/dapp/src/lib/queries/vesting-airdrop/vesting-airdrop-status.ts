"use client";
import { formatDate } from "@/lib/utils/date";
import { addSeconds, isAfter } from "date-fns";
import { useTranslations } from "next-intl";
import type { AirdropClaimStatus } from "../airdrop/airdrop-schema";
import type { VestingAirdropRecipient } from "../airdrop/user-airdrop-schema";

export type VestingAirdropStatusResult = {
  status: AirdropClaimStatus;
  message: string;
};

/**
 * Calculate claimable amount for vesting airdrop
 */
function calculateClaimableAmount(
  vestingStart: Date,
  totalAllocated: number,
  totalClaimed: number,
  vestingDuration: number
): number {
  const currentTime = new Date();
  const timeElapsed = Math.floor(
    (currentTime.getTime() - vestingStart.getTime()) / 1000
  );

  let vestedAmount = 0;
  if (timeElapsed >= vestingDuration) {
    vestedAmount = totalAllocated; // Fully vested
  } else {
    vestedAmount = Math.floor((totalAllocated * timeElapsed) / vestingDuration);
  }

  return vestedAmount - totalClaimed;
}

/**
 * Check if cliff period has passed
 */
function hasCliffPassed(vestingStart: Date, cliffDuration: number): boolean {
  if (cliffDuration <= 0) return true;

  const currentTime = new Date();
  const cliffEnd = addSeconds(vestingStart, cliffDuration);
  return isAfter(currentTime, cliffEnd);
}

/**
 * Calculates the status and tooltip message for a vesting airdrop (server-side version)
 *
 * Note: This is for server-side usage. For client components, use the functions in
 * the airdrop-claim-status component directly.
 *
 * @param recipient - The airdrop recipient data
 * @returns Object containing status and translated message
 */
export function CalculateVestingAirdropStatus(
  airdrop: VestingAirdropRecipient
): VestingAirdropStatusResult {
  const t = useTranslations("portfolio.my-airdrops.tooltip");
  const currentTime = new Date();
  const { claimPeriodEnd, userVestingData, strategy } = airdrop;

  // Early return: User hasn't initialized vesting
  if (!userVestingData?.initialized) {
    if (claimPeriodEnd && isAfter(currentTime, claimPeriodEnd)) {
      return {
        status: "EXPIRED",
        message: t("vesting-airdrop.expired", {
          date: formatDate(claimPeriodEnd),
        }),
      };
    }
    return {
      status: "READY",
      message: t("vesting-airdrop.ready-initialize", {
        date: formatDate(claimPeriodEnd),
      }),
    };
  }

  const totalAllocated = userVestingData.totalAmountAggregated;
  const totalClaimed = userVestingData.claimedAmountTrackedByStrategy;

  // Early return: All tokens claimed
  if (totalClaimed >= totalAllocated) {
    return {
      status: "CLAIMED",
      message: t("vesting-airdrop.claimed"),
    };
  }

  const vestingStart = userVestingData.vestingStart;
  const cliffDuration = Number(strategy?.cliffDuration || 0);

  // Early return: Waiting for cliff to pass
  if (!hasCliffPassed(vestingStart, cliffDuration)) {
    const cliffEnd = addSeconds(vestingStart, cliffDuration);
    return {
      status: "PENDING",
      message: t("vesting-airdrop.pending-cliff", {
        date: formatDate(cliffEnd),
      }),
    };
  }

  // Check if there are claimable tokens
  const vestingDuration = Number(strategy?.vestingDuration || 0);
  if (vestingDuration > 0) {
    const claimableAmount = calculateClaimableAmount(
      vestingStart,
      totalAllocated,
      totalClaimed,
      vestingDuration
    );

    if (claimableAmount > 0) {
      return {
        status: "READY",
        message: t("vesting-airdrop.ready-claim"),
      };
    }
  }

  return {
    status: "PENDING",
    message: t("vesting-airdrop.pending-vesting"),
  };
}
