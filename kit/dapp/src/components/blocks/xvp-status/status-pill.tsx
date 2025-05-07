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

    const approvalsRequired = new Set(item.flows.map((flow) => flow.from.id));
    if (approvalsRequired.size === item.approvals.length) {
      return "approved";
    }

    return "pending";
  };

  const status = getStatus(xvp);

  const statusConfig: Record<XvpStatus, StatusStyle> = {
    pending: {
      variant: "outline",
      className:
        "border-yellow-400/80 bg-yellow-50 text-yellow-700 dark:border-yellow-600/70 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    approved: {
      variant: "outline",
      className:
        "border-blue-400/80 bg-blue-50 text-blue-700 dark:border-blue-600/70 dark:bg-blue-900/30 dark:text-blue-400",
    },
    expired: {
      variant: "outline",
      className:
        "border-gray-400/80 bg-gray-50 text-gray-600 dark:border-gray-600/70 dark:bg-gray-900/30 dark:text-gray-400",
    },
    claimed: {
      variant: "outline",
      className:
        "border-green-400/80 bg-green-50 text-green-700 dark:border-green-600/70 dark:bg-green-900/30 dark:text-green-400",
    },
    cancelled: {
      variant: "destructive",
      className:
        "border-red-400/80 bg-red-50 text-red-700 dark:border-red-600/70 dark:bg-red-900/30 dark:text-red-400",
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
