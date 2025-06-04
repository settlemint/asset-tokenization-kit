import { Badge } from "@/components/ui/badge";
import type { AirdropRecipient } from "@/lib/queries/airdrop/airdrop-recipient-schema";
import type { AirdropClaimStatus } from "@/lib/queries/airdrop/airdrop-schema";
import { cn } from "@/lib/utils";
import { CheckCircle, Clock, Rocket, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type AirdropClaimStatusIndicatorProps = {
  airdropRecipient: AirdropRecipient;
  asBadge?: boolean;
};

/**
 * Calculate the claim status for an airdrop recipient
 */
function calculateAirdropClaimStatus(
  recipient: AirdropRecipient
): AirdropClaimStatus {
  const { airdrop } = recipient;
  const { claimData } = airdrop;
  const currentTime = Math.floor(Date.now() / 1000); // Current timestamp in seconds

  // Check if user has already claimed
  const hasClaimed = !!claimData?.firstClaimedTimestamp;

  switch (airdrop.__typename) {
    case "StandardAirdrop": {
      if (hasClaimed) {
        return "CLAIMED";
      }

      // Access type-specific fields safely
      const startTime = airdrop.startTime;
      const endTime = airdrop.endTime;

      if (startTime && currentTime < Number(startTime)) {
        return "PENDING"; // Not started yet
      }

      if (endTime && currentTime > Number(endTime)) {
        return "EXPIRED"; // Claim period ended
      }

      return "READY"; // Can claim now
    }

    case "PushAirdrop": {
      if (hasClaimed) {
        return "CLAIMED"; // Tokens received
      }

      // Check if distribution is complete
      const totalDistributed = Number(airdrop.totalDistributed || 0);
      const distributionCap = Number(airdrop.distributionCap || 0);

      if (distributionCap > 0 && totalDistributed >= distributionCap) {
        return "EXPIRED"; // Distribution complete, user missed out
      }

      return "PENDING"; // Waiting for admin distribution
    }

    case "VestingAirdrop": {
      const claimPeriodEnd = Number(airdrop.claimPeriodEnd);
      const userVestingData = airdrop.userVestingData;

      if (!userVestingData) {
        // User hasn't initialized vesting
        if (currentTime > claimPeriodEnd) {
          return "EXPIRED"; // Missed initialization deadline
        }
        return "READY"; // Can initialize vesting
      }

      if (!userVestingData.initialized) {
        return "READY"; // Should initialize
      }

      // Check if fully claimed
      const totalAllocated = Number(userVestingData.totalAmountAggregated || 0);
      const totalClaimed = Number(
        userVestingData.claimedAmountTrackedByStrategy || 0
      );

      if (totalClaimed >= totalAllocated) {
        return "CLAIMED"; // All tokens claimed
      }

      // Check cliff status
      const vestingStart = Number(userVestingData.vestingStart);
      const cliffDuration = Number(airdrop.strategy?.cliffDuration || 0);
      const timeSinceVesting = currentTime - vestingStart;

      if (timeSinceVesting < cliffDuration) {
        return "PENDING"; // Waiting for cliff to pass
      }

      // Cliff has passed - check if there are claimable tokens
      const vestingDuration = Number(airdrop.strategy?.vestingDuration || 0);
      const timeElapsed = timeSinceVesting;

      let vestedAmount = 0;
      if (timeElapsed >= vestingDuration) {
        vestedAmount = totalAllocated; // Fully vested
      } else {
        vestedAmount = Math.floor(
          (totalAllocated * timeElapsed) / vestingDuration
        );
      }

      const claimableAmount = vestedAmount - totalClaimed;

      if (claimableAmount > 0) {
        return "READY"; // Has tokens to claim
      }

      return "PENDING"; // No tokens ready yet
    }

    default:
      return "PENDING";
  }
}

export function AirdropClaimStatusIndicator({
  airdropRecipient,
  asBadge = false,
}: AirdropClaimStatusIndicatorProps): ReactElement {
  const t = useTranslations("portfolio.my-airdrops");

  const status = calculateAirdropClaimStatus(airdropRecipient);

  const statusConfig = {
    READY: {
      variant: "default",
      badgeClassName: "bg-primary/80 text-primary-foreground",
      iconClassName: "size-4 text-primary",
      icon: Rocket,
    },
    PENDING: {
      variant: "default",
      badgeClassName: "bg-warning/80 text-warning-foreground",
      iconClassName: "size-4 text-warning",
      icon: Clock,
    },
    CLAIMED: {
      variant: "default",
      badgeClassName: "bg-success/80 text-success-foreground",
      iconClassName: "size-4 text-success",
      icon: CheckCircle,
    },
    EXPIRED: {
      variant: "destructive",
      badgeClassName: "bg-destructive/80 text-destructive-foreground",
      iconClassName: "size-4 text-destructive",
      icon: TriangleAlert,
    },
  } as const;

  const currentStatusStyle = statusConfig[status];

  return asBadge ? (
    <Badge
      variant={currentStatusStyle.variant}
      className={cn(currentStatusStyle.badgeClassName)}
    >
      <currentStatusStyle.icon className="mr-1 size-3" />
      {t(`claim-status.${status}`)}
    </Badge>
  ) : (
    <div className="flex items-center gap-2">
      <currentStatusStyle.icon
        className={cn(currentStatusStyle.iconClassName, "size-4")}
      />
      {t(`claim-status.${status}`)}
    </div>
  );
}
