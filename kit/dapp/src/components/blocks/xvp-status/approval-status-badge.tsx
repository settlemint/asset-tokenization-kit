import { Badge, type badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type ApprovalStatusBadgeProps = {
  hasApproved: boolean;
};

interface StatusStyle extends VariantProps<typeof badgeVariants> {
  className: string;
}

export function ApprovalStatusBadge({
  hasApproved,
}: ApprovalStatusBadgeProps): ReactElement {
  const t = useTranslations("trade-management.xvp");

  const status: "approved" | "pending" = hasApproved ? "approved" : "pending";

  const statusConfig: Record<typeof status, StatusStyle> = {
    pending: {
      variant: "outline",
      className:
        "border-yellow-400/80 bg-yellow-50 text-yellow-700 dark:border-yellow-600/70 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    approved: {
      variant: "outline",
      className:
        "border-green-400/80 bg-green-50 text-green-700 dark:border-green-600/70 dark:bg-green-900/30 dark:text-green-400",
    },
  };

  const currentStatusStyle = statusConfig[status];

  const statusTextMap: Record<typeof status, string> = {
    pending: t("status.pending"),
    approved: t("status.approved"),
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
