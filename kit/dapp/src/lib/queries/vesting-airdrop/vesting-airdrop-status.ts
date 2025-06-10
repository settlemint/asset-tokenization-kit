import { addSeconds, isAfter, isBefore } from "date-fns";

export async function calculateVestingAirdropStatus({
  claimPeriodEndMicroSeconds,
  vestingDurationSeconds,
  cliffDurationSeconds,
}: {
  claimPeriodEndMicroSeconds: string;
  vestingDurationSeconds: string;
  cliffDurationSeconds: string;
}) {
  const currentTime = new Date();

  if (isBefore(currentTime, Number(claimPeriodEndMicroSeconds) * 1000)) {
    return "UPCOMING" as const;
  }

  const startTime = addSeconds(
    Number(claimPeriodEndMicroSeconds) * 1000,
    Number(cliffDurationSeconds)
  );
  const endTime = addSeconds(startTime, Number(vestingDurationSeconds));

  if (isAfter(currentTime, endTime)) {
    return "ENDED" as const;
  }

  return "ACTIVE" as const;
}
