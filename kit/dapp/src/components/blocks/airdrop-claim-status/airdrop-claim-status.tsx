import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { AirdropStatus } from "@/lib/queries/airdrop/airdrop-schema";
import { cn } from "@/lib/utils";
import type { AirdropType } from "@/lib/utils/typebox/airdrop-types";
import { CalendarMinus2, Clock, Info, PlayCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type AirdropClaimStatusIndicatorProps = {
  asBadge?: boolean;
  status: AirdropStatus;
  type: AirdropType;
};

export function AirdropClaimStatusIndicator({
  status,
  asBadge = false,
  type,
}: AirdropClaimStatusIndicatorProps): ReactElement {
  const t = useTranslations("portfolio.my-airdrops");

  const statusConfig = {
    ENDED: {
      variant: "default",
      badgeClassName: "bg-primary/80 text-primary-foreground",
      iconClassName: "size-4 text-primary",
      icon: CalendarMinus2,
    },
    UPCOMING: {
      variant: "default",
      badgeClassName: "bg-warning/80 text-warning-foreground",
      iconClassName: "size-4 text-warning",
      icon: Clock,
    },
    ACTIVE: {
      variant: "default",
      badgeClassName: "bg-success/80 text-success-foreground",
      iconClassName: "size-4 text-success",
      icon: PlayCircle,
    },
  } as const;

  const currentStatusStyle = statusConfig[status];
  const message = t(`tooltip.${type}.${status}`);

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
