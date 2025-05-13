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
    <>
      <span>
        {hasApproved ? (
          <CheckCircle className="size-4 text-success" />
        ) : (
          <X className="size-4 text-destructive" />
        )}
      </span>
      <span>
        {hasApproved ? t("status.APPROVED") : t("status.NOT_APPROVED")}
      </span>
    </>
  );
}
