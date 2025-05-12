import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle, X } from "lucide-react";
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
          : "bg-destructive/80 text-destructive-foreground"
      )}
    >
      <span>
        {hasApproved ? (
          <CheckCircle className="size-4" />
        ) : (
          <X className="size-4" />
        )}
      </span>
      {hasApproved ? t("status.approved") : t("status.not-approved")}
    </Badge>
  );
}
