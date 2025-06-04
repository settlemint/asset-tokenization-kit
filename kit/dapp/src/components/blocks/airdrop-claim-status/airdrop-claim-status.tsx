import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AirdropRecipient } from "@/lib/queries/airdrop/airdrop-recipient-schema";
import type { AirdropClaimStatus } from "@/lib/queries/airdrop/airdrop-schema";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { addSeconds, isAfter, isBefore } from "date-fns";
import { CheckCircle, Clock, Info, Rocket, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type AirdropClaimStatusIndicatorProps = {
  airdropRecipient: AirdropRecipient;
  asBadge?: boolean;
};

/**
 * Generate tooltip message explaining the claim status based on airdrop type and status
 */
function getStatusTooltipMessage(
  recipient: AirdropRecipient,
  status: AirdropClaimStatus
): string {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const t = useTranslations("portfolio.my-airdrops.tooltip");
  const { airdrop } = recipient;

  switch (airdrop.__typename) {
    case "StandardAirdrop": {
      switch (status) {
        case "PENDING":
          return t("standard-airdrop.pending-with-start", {
            date: formatDate(airdrop.startTime),
          });
        case "READY":
          return t("standard-airdrop.ready-with-end", {
            date: formatDate(airdrop.endTime),
          });
        case "EXPIRED":
          return t("standard-airdrop.expired", {
            date: formatDate(airdrop.endTime),
          });
        case "CLAIMED":
          return t("standard-airdrop.claimed");
        default:
          return exhaustiveGuard(status);
      }
    }

    case "PushAirdrop": {
      const totalDistributed = airdrop.totalDistributed || 0;
      const distributionCap = airdrop.distributionCap || 0;

      switch (status) {
        case "READY":
          return t("push-airdrop.ready");
        case "PENDING":
          return t("push-airdrop.pending");
        case "EXPIRED":
          return t("push-airdrop.expired", {
            distributed: totalDistributed,
            cap: distributionCap,
          });
        case "CLAIMED":
          return t("push-airdrop.claimed");
        default:
          return exhaustiveGuard(status);
      }
    }

    case "VestingAirdrop": {
      const userVestingData = airdrop.userVestingData;
      const cliffDuration = airdrop.strategy?.cliffDuration || 0;

      switch (status) {
        case "READY":
          if (!userVestingData?.initialized) {
            return t("vesting-airdrop.ready-initialize", {
              date: formatDate(airdrop.claimPeriodEnd),
            });
          }
          return t("vesting-airdrop.ready-claim");
        case "PENDING":
          if (!userVestingData?.initialized) {
            return t("vesting-airdrop.pending-not-initialized");
          }
          if (Number(cliffDuration) > 0) {
            const vestingStart = userVestingData.vestingStart;
            const cliffEnd = addSeconds(vestingStart, Number(cliffDuration));
            return t("vesting-airdrop.pending-cliff", {
              date: formatDate(cliffEnd),
            });
          }
          return t("vesting-airdrop.pending-vesting");
        case "EXPIRED":
          return t("vesting-airdrop.expired", {
            date: formatDate(airdrop.claimPeriodEnd),
          });
        case "CLAIMED":
          return t("vesting-airdrop.claimed");
        default:
          return exhaustiveGuard(status);
      }
    }

    default:
      return exhaustiveGuard(airdrop);
  }
}

/**
 * Calculate the claim status for an airdrop recipient
 */
function calculateAirdropClaimStatus(
  recipient: AirdropRecipient
): AirdropClaimStatus {
  const { airdrop } = recipient;
  const { claimData } = airdrop;
  const currentTime = new Date();

  // Check if user has already claimed
  const hasClaimed = !!claimData?.firstClaimedTimestamp;

  switch (airdrop.__typename) {
    case "StandardAirdrop": {
      if (hasClaimed) {
        return "CLAIMED";
      }

      if (isBefore(currentTime, airdrop.startTime)) {
        return "PENDING";
      }

      if (isAfter(currentTime, airdrop.endTime)) {
        return "EXPIRED";
      }

      return "READY";
    }

    case "PushAirdrop": {
      if (hasClaimed) {
        return "CLAIMED";
      }

      const totalDistributed = airdrop.totalDistributed;
      const distributionCap = airdrop.distributionCap;

      if (distributionCap > 0 && totalDistributed >= distributionCap) {
        return "EXPIRED";
      }

      return "PENDING";
    }

    case "VestingAirdrop": {
      const claimPeriodEnd = airdrop.claimPeriodEnd;
      const userVestingData = airdrop.userVestingData;

      if (!userVestingData) {
        // User hasn't initialized vesting
        if (claimPeriodEnd && isAfter(currentTime, claimPeriodEnd)) {
          return "EXPIRED"; // Missed initialization deadline
        }
        return "READY"; // Can initialize vesting
      }

      if (!userVestingData.initialized) {
        return "READY"; // Should initialize
      }

      // Check if fully claimed
      const totalAllocated = userVestingData.totalAmountAggregated || 0;
      const totalClaimed = userVestingData.claimedAmountTrackedByStrategy || 0;

      if (totalClaimed >= totalAllocated) {
        return "CLAIMED"; // All tokens claimed
      }

      // Check cliff status
      const vestingStart = userVestingData.vestingStart;
      const cliffDuration = Number(airdrop.strategy?.cliffDuration);

      if (vestingStart && cliffDuration > 0) {
        const cliffEnd = addSeconds(vestingStart, cliffDuration);
        if (isBefore(currentTime, cliffEnd)) {
          return "PENDING"; // Waiting for cliff to pass
        }
      }

      // Cliff has passed - check if there are claimable tokens
      // TODO: move to subgraph + refetch
      const vestingDuration = Number(airdrop.strategy?.vestingDuration);

      if (vestingDuration > 0) {
        const timeElapsed = Math.floor(
          (currentTime.getTime() - vestingStart.getTime()) / 1000
        );

        let vestedAmount = 0;
        if (timeElapsed >= Number(vestingDuration)) {
          vestedAmount = totalAllocated; // Fully vested
        } else {
          vestedAmount = Math.floor(
            (totalAllocated * timeElapsed) / Number(vestingDuration)
          );
        }

        const claimableAmount = vestedAmount - totalClaimed;

        if (claimableAmount > 0) {
          return "READY"; // Has tokens to claim
        }
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
  const tooltipMessage = getStatusTooltipMessage(airdropRecipient, status);

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

  const StatusContent = () => (
    <>
      <currentStatusStyle.icon className="mr-1 size-3" />
      {t(`claim-status.${status}`)}
    </>
  );

  const StatusWithTooltip = () => (
    <div className="flex items-center gap-2">
      {asBadge ? (
        <Badge
          variant={currentStatusStyle.variant}
          className={cn(currentStatusStyle.badgeClassName)}
        >
          <StatusContent />
        </Badge>
      ) : (
        <div className="flex items-center gap-2">
          <currentStatusStyle.icon
            className={cn(currentStatusStyle.iconClassName, "size-4")}
          />
          {t(`claim-status.${status}`)}
        </div>
      )}
      {tooltipMessage && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="size-4 text-muted-foreground"
                aria-label={t("status-info-label")}
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-accent-foreground text-xs">{tooltipMessage}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  return <StatusWithTooltip />;
}
