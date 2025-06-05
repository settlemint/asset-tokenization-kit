import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AirdropRecipient } from "@/lib/queries/airdrop/airdrop-recipient-schema";
import type { AirdropClaimStatus } from "@/lib/queries/airdrop/airdrop-schema";
import { CalculatePushAirdropStatus } from "@/lib/queries/push-airdrop/push-airdrop-status";
import { CalculateStandardAirdropStatus } from "@/lib/queries/standard-airdrop/standard-airdrop-status";
import { CalculateVestingAirdropStatus } from "@/lib/queries/vesting-airdrop/vesting-airdrop-status";
import { cn } from "@/lib/utils";
import { exhaustiveGuard } from "@/lib/utils/exhaustive-guard";
import { CheckCircle, Clock, Info, Rocket, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type AirdropClaimStatusIndicatorProps = {
  airdrop: AirdropRecipient["airdrop"];
  asBadge?: boolean;
};

type StatusResult = {
  status: AirdropClaimStatus;
  message: string;
};

/**
 * Calculate airdrop status and message based on type
 */
function calculateAirdropStatusAndMessage(
  airdrop: AirdropRecipient["airdrop"]
): StatusResult {
  switch (airdrop.__typename) {
    case "StandardAirdrop":
      return CalculateStandardAirdropStatus(airdrop);

    case "PushAirdrop":
      return CalculatePushAirdropStatus(airdrop);

    case "VestingAirdrop":
      return CalculateVestingAirdropStatus(airdrop);

    default:
      exhaustiveGuard(airdrop);
  }
}

export function AirdropClaimStatusIndicator({
  airdrop,
  asBadge = false,
}: AirdropClaimStatusIndicatorProps): ReactElement {
  const t = useTranslations("portfolio.my-airdrops");
  const { status, message } = calculateAirdropStatusAndMessage(airdrop);

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
      {message && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info
                className="size-4 text-muted-foreground"
                aria-label={t("status-info-label")}
              />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-accent-foreground text-xs">{message}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );

  return <StatusWithTooltip />;
}
