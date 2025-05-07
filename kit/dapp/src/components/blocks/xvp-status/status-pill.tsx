import { Badge, type badgeVariants } from "@/components/ui/badge";
import type { XvPSettlement } from "@/lib/queries/xvp/xvp-schema";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { isBefore } from "date-fns";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type XvpStatusPillProps = {
  xvp: XvPSettlement;
};

export type XvpStatus =
  | "pending"
  | "approved"
  | "expired"
  | "claimed"
  | "cancelled";

interface StatusStyle extends VariantProps<typeof badgeVariants> {
  className: string;
}

export function XvpStatusPill({ xvp }: XvpStatusPillProps): ReactElement {
  const t = useTranslations("trade-management.xvp");
  const getStatus = (item: XvPSettlement): XvpStatus => {
    if (item.claimed) {
      return "claimed";
    }
    if (item.cancelled) {
      return "cancelled";
    }
    const cutoffTimeMs = Number(item.cutoffDate) * 1000;
    const isExpired = isBefore(cutoffTimeMs, new Date().getTime());
    if (isExpired) {
      return "expired";
    }

    const approvalsRequiredCount = item.flows.length;
    const actualApprovalsCount = item.approvals.filter(
      (approval) => approval.approved
    ).length;

    if (
      approvalsRequiredCount > 0 &&
      actualApprovalsCount === approvalsRequiredCount
    ) {
      return "approved";
    }

    return "pending";
  };

  const status = getStatus(xvp);

  const statusConfig: Record<XvpStatus, StatusStyle> = {
    pending: {
      variant: "default",
      className: "bg-warning/80 text-warning-foreground",
    },
    approved: {
      variant: "default",
      className: "bg-primary/80 text-primary-foreground",
    },
    expired: {
      variant: "outline",
      className: "text-muted-foreground",
    },
    claimed: {
      variant: "default",
      className: "bg-success/80 text-success-foreground",
    },
    cancelled: {
      variant: "destructive",
      className: "bg-destructive/80 text-destructive-foreground",
    },
  };

  const currentStatusStyle = statusConfig[status];

  const statusTextMap: Record<XvpStatus, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
    expired: t("status.expired"),
    claimed: t("status.claimed"),
    cancelled: t("status.cancelled"),
  };

  return (
    <Badge
      variant={currentStatusStyle.variant}
      className={cn(currentStatusStyle.className)}
    >
      {statusTextMap[status]}
    </Badge>
  );
}
