import { addSeconds, isAfter, isBefore } from "date-fns";

export function calculateVestingAirdropStatus({
  claimPeriodEndMicroSeconds,
  vestingDurationSeconds,
  cliffDurationSeconds,
}: {
  claimPeriodEndMicroSeconds: string;
  vestingDurationSeconds: string;
  cliffDurationSeconds: string;
}) {
  const currentTime = new Date();
  const claimPeriodEndDate = new Date(
    Number(claimPeriodEndMicroSeconds) / 1000
  );

  if (isBefore(currentTime, claimPeriodEndDate)) {
    return "UPCOMING" as const;
  }

  const startTime = addSeconds(
    claimPeriodEndDate,
    Number(cliffDurationSeconds)
  );
  const endTime = addSeconds(startTime, Number(vestingDurationSeconds));

  if (isAfter(currentTime, endTime)) {
    return "ENDED" as const;
  }

  return "ACTIVE" as const;
}
