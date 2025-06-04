import { useTranslations } from "next-intl";
import type { PushAirdropRecipient } from "../airdrop/airdrop-recipient-schema";
import type { AirdropClaimStatus } from "../airdrop/airdrop-schema";

export type PushAirdropStatusResult = {
  status: AirdropClaimStatus;
  message: string;
};

/**
 * Calculates the status and tooltip message for a push airdrop (server-side version)
 *
 * Note: This is for server-side usage. For client components, use the functions in
 * the airdrop-claim-status component directly.
 *
 * @param recipient - The airdrop recipient data
 * @returns Object containing status and translated message
 */
export function CalculatePushAirdropStatus(
  airdrop: PushAirdropRecipient
): PushAirdropStatusResult {
  const t = useTranslations("portfolio.my-airdrops.tooltip");

  // Check if user has already claimed
  const hasClaimed = !!airdrop.claimData?.firstClaimedTimestamp;

  if (hasClaimed) {
    return {
      status: "CLAIMED",
      message: t("push-airdrop.claimed"),
    };
  }

  const totalDistributed = airdrop.totalDistributed;
  const distributionCap = airdrop.distributionCap;

  if (distributionCap > 0 && totalDistributed >= distributionCap) {
    return {
      status: "EXPIRED",
      message: t("push-airdrop.expired", {
        distributed: totalDistributed,
        cap: distributionCap,
      }),
    };
  }

  // For push airdrops, if not expired and not claimed, it's typically pending
  // since they don't have a specific "ready" state like standard airdrops
  return {
    status: "PENDING",
    message: t("push-airdrop.pending"),
  };
}
