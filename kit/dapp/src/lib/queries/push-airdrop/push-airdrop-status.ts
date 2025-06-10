"use server";
import { getTranslations } from "next-intl/server";
import type { AirdropStatus } from "../airdrop/airdrop-schema";

export type PushAirdropStatusResult = {
  status: AirdropStatus;
  message: string;
};

export interface CalculatePushAirdropStatusProps {
  distributionCap: string;
  totalDistributed: string;
}

/**
 * Calculates the status and tooltip message for a push airdrop (server-side version)
 *
 * Note: This is for server-side usage. For client components, use the functions in
 * the airdrop-claim-status component directly.
 *
 * @param recipient - The airdrop recipient data
 * @returns Object containing status and translated message
 */
export async function calculatePushAirdropStatus({
  distributionCap,
  totalDistributed,
}: CalculatePushAirdropStatusProps) {
  const t = await getTranslations("portfolio.my-airdrops.tooltip");

  if (
    Number(distributionCap) > 0 &&
    Number(totalDistributed) >= Number(distributionCap)
  ) {
    return {
      status: "ENDED" as const,
      message: t("push-airdrop.ended"),
    };
  }

  return {
    status: "ACTIVE" as const,
    message: t("push-airdrop.ready"),
  };
}
