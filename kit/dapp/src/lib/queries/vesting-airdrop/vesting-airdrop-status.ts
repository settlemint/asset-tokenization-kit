"use server";
import { formatDate } from "@/lib/utils/date";
import { addSeconds, isAfter, isBefore } from "date-fns";
import { getTranslations } from "next-intl/server";
import type { AirdropStatus } from "../airdrop/airdrop-schema";

export type VestingAirdropStatusResult = {
  status: AirdropStatus;
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

export interface CalculateVestingAirdropStatusProps {
  claimPeriodEndMicroSeconds: string;
  vestingDurationSeconds: string;
  cliffDurationSeconds: string;
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
export async function calculateVestingAirdropStatus({
  claimPeriodEndMicroSeconds,
  vestingDurationSeconds,
  cliffDurationSeconds,
}: CalculateVestingAirdropStatusProps) {
  const t = await getTranslations("portfolio.my-airdrops.tooltip");
  const currentTime = new Date();

  if (isBefore(currentTime, Number(claimPeriodEndMicroSeconds) * 1000)) {
    return {
      status: "UPCOMING" as const,
      message: t("vesting-airdrop.ready-initialize", {
        date: formatDate(claimPeriodEndMicroSeconds, {
          type: "absolute",
        }),
      }),
    };
  }

  const startTime = addSeconds(
    Number(claimPeriodEndMicroSeconds) * 1000,
    Number(cliffDurationSeconds)
  );
  const endTime = addSeconds(startTime, Number(vestingDurationSeconds));

  if (isAfter(currentTime, endTime)) {
    return {
      status: "ENDED" as const,
      message: t("vesting-airdrop.ended", {
        date: formatDate(endTime),
      }),
    };
  }

  return {
    status: "ACTIVE" as const,
    message: t("vesting-airdrop.ready-claim", {
      date: formatDate(endTime),
    }),
  };
}

// export function calculateVestingAirdropAmounts(
//   airdrop: VestingAirdropRecipient,
//   amountExact: bigint
// ) {
//   const currentTime = new Date();
//   const { userVestingData } = airdrop;

//   if (
//     !userVestingData?.initialized &&
//     isAfter(currentTime, airdrop.claimPeriodEnd)
//   ) {
//     return {
//       claimableExact: 0,
//       vestedExact: 0,
//       claimedExact: 0,
//       totalAllocatedExact: amountExact,
//     };
//   }

//   // No vesting start -> claim has not been initialized
//   if (!userVestingData?.vestingStart) {
//     return {
//       claimableExact: 0,
//       vestedExact: 0,
//       claimedExact: 0,
//       totalAllocatedExact: amountExact,
//     };
//   }

//   const vestingStart = userVestingData.vestingStart;
//   const cliffDuration = airdrop.strategy?.cliffDuration;

//   if (!hasCliffPassed(vestingStart, cliffDuration)) {
//     return {
//       claimedExact: 0,
//       claimableExact: 0,
//       vestedExact: amountExact,
//       totalAllocatedExact: amountExact,
//     };
//   }

//   const claimableAmountExact = calculateClaimableAmount(
//     vestingStart,
//     amountExact,
//     userVestingData.claimedAmountTrackedByStrategyExact,
//     airdrop.strategy?.vestingDuration
//   );

//   const vestedExact =
//     amountExact -
//     claimableAmountExact -
//     userVestingData.claimedAmountTrackedByStrategyExact;

//   return {
//     claimableExact: claimableAmountExact,
//     vestedExact: vestedExact > BigInt(0) ? vestedExact : BigInt(0),
//     claimedExact: userVestingData.claimedAmountTrackedByStrategyExact,
//     totalAllocatedExact: amountExact,
//   };
// }
