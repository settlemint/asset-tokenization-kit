import { Badge } from "@/components/ui/badge";
import type { XvPSettlement, XvPStatus } from "@/lib/queries/xvp/xvp-schema";
import { cn } from "@/lib/utils";
import { isBefore } from "date-fns";
import { CheckCircle, Clock, Rocket, TriangleAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type XvpStatusPillProps = {
  xvp: XvPSettlement;
  asBadge?: boolean;
};

export function XvpStatus({
  xvp,
  asBadge = false,
}: XvpStatusPillProps): ReactElement {
  const t = useTranslations("trade-management.xvp");
  const getStatus = (item: XvPSettlement): XvPStatus => {
    if (item.executed) {
      return "EXECUTED";
    }
    if (item.cancelled) {
      return "CANCELLED";
    }
    const cutoffTimeMs = Number(item.cutoffDate) * 1000;
    const isExpired = isBefore(cutoffTimeMs, new Date().getTime());
    if (isExpired) {
      return "EXPIRED";
    }

    const approvalsRequiredCount = item.flows.length;
    const actualApprovalsCount = item.approvals.filter(
      (approval) => approval.approved
    ).length;

    if (
      approvalsRequiredCount > 0 &&
      actualApprovalsCount === approvalsRequiredCount
    ) {
      return "READY";
    }

    return "PENDING";
  };

  const status = getStatus(xvp);

  const statusConfig = {
    PENDING: {
      variant: "default",
      badgeClassName: "bg-warning/80 text-warning-foreground",
      iconClassName: "size-4 text-warning-foreground",
      icon: Clock,
    },
    READY: {
      variant: "default",
      badgeClassName: "bg-primary/80 text-primary-foreground",
      iconClassName: "size-4 text-primary",
      icon: Rocket,
    },
    CANCELLED: {
      variant: "outline",
      badgeClassName: "text-muted-foreground",
      iconClassName: "size-4 text-muted-foreground",
      icon: X,
    },
    EXECUTED: {
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
      {t(`status.${status}`)}
    </Badge>
  ) : (
    <div className="flex items-center gap-2">
      <currentStatusStyle.icon
        className={cn(currentStatusStyle.iconClassName, "size-4")}
      />
      {t(`status.${status}`)}
    </div>
  );
}
