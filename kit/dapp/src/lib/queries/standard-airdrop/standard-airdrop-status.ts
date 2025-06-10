import { formatDate } from "@/lib/utils/date";
import { isAfter, isBefore } from "date-fns";

export async function calculateStandardAirdropStatus({
  startTimeMicroSeconds,
  endTimeMicroSeconds,
}: {
  startTimeMicroSeconds: string;
  endTimeMicroSeconds: string;
}) {
  const currentTime = new Date();
  const startTimeSeconds = Number(
    formatDate(startTimeMicroSeconds, {
      type: "unixSeconds",
    })
  );
  const endTimeSeconds = Number(
    formatDate(endTimeMicroSeconds, {
      type: "unixSeconds",
    })
  );

  if (isBefore(currentTime, startTimeSeconds * 1000)) {
    return "UPCOMING" as const;
  }

  if (isAfter(currentTime, endTimeSeconds * 1000)) {
    return "ENDED" as const;
  }

  return "ACTIVE" as const;
}
