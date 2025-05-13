import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { XvPSettlement, XvPStatus } from "@/lib/queries/xvp/xvp-schema";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { isBefore } from "date-fns";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type XvpStatusPillProps = {
  xvp: XvPSettlement;
};

interface StatusStyle extends VariantProps<typeof badgeVariants> {
  className: string;
}

export function XvpStatusPill({ xvp }: XvpStatusPillProps): ReactElement {
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

  const statusConfig: Record<XvPStatus, StatusStyle> = {
    PENDING: {
      variant: "default",
      className: "bg-warning/80 text-warning-foreground",
    },
    READY: {
      variant: "default",
      className: "bg-primary/80 text-primary-foreground",
    },
    CANCELLED: {
      variant: "outline",
      className: "text-muted-foreground",
    },
    EXECUTED: {
      variant: "default",
      className: "bg-success/80 text-success-foreground",
    },
    EXPIRED: {
      variant: "destructive",
      className: "bg-destructive/80 text-destructive-foreground",
    },
  };

  const currentStatusStyle = statusConfig[status];

  return (
    <Badge
      variant={currentStatusStyle.variant}
      className={cn(currentStatusStyle.className)}
    >
      {t(`status.${status}`)}
    </Badge>
  );
}
