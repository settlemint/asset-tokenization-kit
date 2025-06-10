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
  totalAllocatedExact: bigint,
  totalClaimedExact: bigint,
  vestingDuration: bigint = BigInt(0)
) {
  const currentTime = new Date();
  const timeElapsed = BigInt(
    Math.floor((currentTime.getTime() - vestingStart.getTime()) / 1000)
  );

  if (vestingDuration === BigInt(0)) {
    return 0n;
  }

  let vestedAmount = BigInt(0);
  if (timeElapsed >= vestingDuration) {
    vestedAmount = totalAllocatedExact; // Fully vested
  } else {
    vestedAmount = BigInt(
      (totalAllocatedExact * timeElapsed) / vestingDuration
    );
  }

  return vestedAmount - totalClaimedExact;
}

/**
 * Check if cliff period has passed
 */
function hasCliffPassed(vestingStart: Date, cliffDuration?: bigint): boolean {
  if (!cliffDuration || cliffDuration <= 0) return true;

  const currentTime = new Date();
  const cliffEnd = addSeconds(vestingStart, Number(cliffDuration));
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
  airdrop: VestingAirdropRecipient,
  amountExact: string
): VestingAirdropStatusResult {
  const t = useTranslations("portfolio.my-airdrops.tooltip");
  const currentTime = new Date();
  const { claimPeriodEnd, strategy, userVestingData } = airdrop;

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

  const totalAllocatedExact = BigInt(amountExact);
  const totalClaimedExact = userVestingData.claimedAmountTrackedByStrategyExact;

  // Early return: All tokens claimed
  if (totalClaimedExact >= totalAllocatedExact) {
    return {
      status: "CLAIMED",
      message: t("vesting-airdrop.claimed"),
    };
  }

  const vestingStart = userVestingData.vestingStart;
  const cliffDuration = strategy?.cliffDuration;

  // Early return: Waiting for cliff to pass
  if (!hasCliffPassed(vestingStart, cliffDuration)) {
    const cliffEnd = addSeconds(vestingStart, Number(cliffDuration));
    return {
      status: "PENDING",
      message: t("vesting-airdrop.pending-cliff", {
        date: formatDate(cliffEnd),
      }),
    };
  }

  // Check if there are claimable tokens
  const claimableAmount = calculateClaimableAmount(
    vestingStart,
    totalAllocatedExact,
    totalClaimedExact,
    strategy?.vestingDuration || BigInt(0)
  );

  if (claimableAmount > 0) {
    return {
      status: "READY",
      message: t("vesting-airdrop.ready-claim"),
    };
  }

  return {
    status: "PENDING",
    message: t("vesting-airdrop.pending-vesting"),
  };
}

export function calculateVestingAirdropAmounts(
  airdrop: VestingAirdropRecipient,
  amountExact: bigint
) {
  const currentTime = new Date();
  const { userVestingData } = airdrop;

  if (
    !userVestingData?.initialized &&
    isAfter(currentTime, airdrop.claimPeriodEnd)
  ) {
    return {
      claimableExact: 0,
      vestedExact: 0,
      claimedExact: 0,
      totalAllocatedExact: amountExact,
    };
  }

  // No vesting start -> claim has not been initialized
  if (!userVestingData?.vestingStart) {
    return {
      claimableExact: 0,
      vestedExact: 0,
      claimedExact: 0,
      totalAllocatedExact: amountExact,
    };
  }

  const vestingStart = userVestingData.vestingStart;
  const cliffDuration = airdrop.strategy?.cliffDuration;

  if (!hasCliffPassed(vestingStart, cliffDuration)) {
    return {
      claimedExact: 0,
      claimableExact: 0,
      vestedExact: amountExact,
      totalAllocatedExact: amountExact,
    };
  }

  const claimableAmountExact = calculateClaimableAmount(
    vestingStart,
    amountExact,
    userVestingData.claimedAmountTrackedByStrategyExact,
    airdrop.strategy?.vestingDuration
  );

  const vestedExact =
    amountExact -
    claimableAmountExact -
    userVestingData.claimedAmountTrackedByStrategyExact;

  return {
    claimableExact: claimableAmountExact,
    vestedExact: vestedExact > BigInt(0) ? vestedExact : BigInt(0),
    claimedExact: userVestingData.claimedAmountTrackedByStrategyExact,
    totalAllocatedExact: amountExact,
  };
}
