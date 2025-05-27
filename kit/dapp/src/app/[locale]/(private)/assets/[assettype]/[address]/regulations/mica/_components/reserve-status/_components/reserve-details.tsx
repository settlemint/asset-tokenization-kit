"use client";

import { Badge } from "@/components/ui/badge";
import { ReserveComplianceStatus } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { formatDate } from "@/lib/utils/date";
import { useLocale, useTranslations } from "next-intl";

interface ReserveDetailsProps {
  lastAuditDate?: string;
  reserveStatus?: ReserveComplianceStatus;
  circulatingSupply?: number;
  reserveValue?: number;
}

export function ReserveDetails({
  lastAuditDate,
  reserveStatus,
  circulatingSupply,
  reserveValue,
}: ReserveDetailsProps) {
  const t = useTranslations("regulations.mica.dashboard.reserve-status");
  const locale = useLocale();

  // Get status color and label based on status
  const getStatusColor = (status: ReserveComplianceStatus) => {
    switch (status) {
      case ReserveComplianceStatus.COMPLIANT:
        return "bg-success text-success-foreground";
      case ReserveComplianceStatus.PENDING_REVIEW:
        return "bg-warning text-warning-foreground";
      case ReserveComplianceStatus.UNDER_INVESTIGATION:
        return "bg-warning text-warning-foreground";
      case ReserveComplianceStatus.NON_COMPLIANT:
        return "bg-destructive text-destructive-foreground";
      case ReserveComplianceStatus.PENDING_SETUP:
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: ReserveComplianceStatus) => {
    switch (status) {
      case ReserveComplianceStatus.COMPLIANT:
        return t("form.fields.audit-details.status.compliant");
      case ReserveComplianceStatus.PENDING_REVIEW:
        return t("form.fields.audit-details.status.pending-review");
      case ReserveComplianceStatus.UNDER_INVESTIGATION:
        return t("form.fields.audit-details.status.under-investigation");
      case ReserveComplianceStatus.NON_COMPLIANT:
        return t("form.fields.audit-details.status.non-compliant");
      case ReserveComplianceStatus.PENDING_SETUP:
        return t("form.fields.audit-details.status.pending-setup");
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-muted-foreground text-sm">
          {t("details.fields.circulating-supply.title")}
        </h3>
        <p>{circulatingSupply ?? "-"}</p>
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm">
          {t("details.fields.reserve-value.title")}
        </h3>
        <p>{reserveValue ?? "-"}</p>
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm">
          {t("form.fields.audit-details.last-audit-date")}
        </h3>
        <p>
          {lastAuditDate
            ? formatDate(new Date(lastAuditDate), {
                type: "absolute",
                locale: locale,
              })
            : "-"}
        </p>
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm">
          {t("form.fields.audit-details.reserve-status")}
        </h3>
        <Badge
          className={getStatusColor(
            reserveStatus ?? ReserveComplianceStatus.PENDING_SETUP
          )}
        >
          {getStatusLabel(
            reserveStatus ?? ReserveComplianceStatus.PENDING_SETUP
          )}
        </Badge>
      </div>
    </div>
  );
}
