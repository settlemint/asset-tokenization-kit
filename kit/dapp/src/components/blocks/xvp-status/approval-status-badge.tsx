import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ReactElement } from "react";

type ApprovalStatusBadgeProps = {
  hasApproved: boolean;
};

export function ApprovalStatusBadge({
  hasApproved,
}: ApprovalStatusBadgeProps): ReactElement {
  const t = useTranslations("trade-management.xvp");

  return (
    <Badge
      variant="default"
      className={cn(
        hasApproved
          ? "bg-primary/80 text-primary-foreground"
          : "bg-warning/80 text-warning-foreground"
      )}
    >
      {hasApproved ? t("status.approved") : t("status.pending")}
    </Badge>
  );
}
