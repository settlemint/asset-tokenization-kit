"use server";
import { formatDate } from "@/lib/utils/date";
import { isAfter, isBefore } from "date-fns";
import { getTranslations } from "next-intl/server";

export interface CalculateStandardAirdropStatusProps {
  startTimeMicroSeconds: string;
  endTimeMicroSeconds: string;
}

/**
 * Calculates the status and tooltip message for a standard airdrop (server-side version)
 *
 * Note: This is for server-side usage. For client components, use the functions in
 * the airdrop-claim-status component directly.
 *
 * @param recipient - The airdrop recipient data
 * @returns Object containing status and translated message
 */
export async function calculateStandardAirdropStatus({
  startTimeMicroSeconds,
  endTimeMicroSeconds,
}: CalculateStandardAirdropStatusProps) {
  const t = await getTranslations("portfolio.my-airdrops.tooltip");
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
    return {
      status: "UPCOMING" as const,
      message: t("standard-airdrop.pending-with-start", {
        date: formatDate(startTimeMicroSeconds, {
          type: "absolute",
        }),
      }),
    };
  }

  if (isAfter(currentTime, endTimeSeconds * 1000)) {
    return {
      status: "ACTIVE" as const,
      message: t("standard-airdrop.expired", {
        date: formatDate(endTimeMicroSeconds, {
          type: "absolute",
        }),
      }),
    };
  }

  return {
    status: "ENDED" as const,
    message: t("standard-airdrop.ready-with-end", {
      date: formatDate(endTimeMicroSeconds, {
        type: "absolute",
      }),
    }),
  };
}
