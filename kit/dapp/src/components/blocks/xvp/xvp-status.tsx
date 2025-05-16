import { Badge } from "@/components/ui/badge";
import type { XvPSettlement, XvPStatus } from "@/lib/queries/xvp/xvp-schema";
import { cn } from "@/lib/utils";
import { isBefore } from "date-fns";
import { CheckCircle, Clock, Rocket, TriangleAlert, X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type XvPStatusIndicatorProps = {
  xvp: XvPSettlement;
  asBadge?: boolean;
};

/**
 * Calculates the status of an XvP settlement based on execution, cancellation, expiration, and approvals
 *
 * @param settlement - The raw settlement data from The Graph
 * @returns The calculated XvP status
 */
function calculateXvPStatus(settlement: XvPSettlement): XvPStatus {
  if (settlement.executed) {
    return "EXECUTED";
  }

  if (settlement.cancelled) {
    return "CANCELLED";
  }

  const isExpired = isBefore(settlement.cutoffDate, new Date());
  if (isExpired) {
    return "EXPIRED";
  }

  // Ensure flows is an array, default to empty if not present
  const flows = Array.isArray(settlement.flows) ? settlement.flows : [];

  const approvalsRequiredCount = flows.length;
  const actualApprovalsCount = settlement.approvals.filter(
    (approval) => approval.approved
  ).length;

  if (
    approvalsRequiredCount > 0 &&
    actualApprovalsCount === approvalsRequiredCount
  ) {
    return "READY";
  }

  return "PENDING";
}

export function XvPStatusIndicator({
  xvp,
  asBadge = false,
}: XvPStatusIndicatorProps): ReactElement {
  const t = useTranslations("trade-management.xvp");

  const status = calculateXvPStatus(xvp);

  const statusConfig = {
    PENDING: {
      variant: "default",
      badgeClassName: "bg-warning/80 text-warning-foreground",
      iconClassName: "size-4 text-warning",
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
