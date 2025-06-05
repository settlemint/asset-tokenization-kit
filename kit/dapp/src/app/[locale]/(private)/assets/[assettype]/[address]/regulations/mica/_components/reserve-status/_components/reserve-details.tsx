"use client";

import {
  StatusPill,
  type StatusType,
} from "@/components/blocks/status-pill/status-pill";
import { ReserveComplianceStatus } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { useTranslations } from "next-intl";

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

  const getStatusConfig = (status: ReserveComplianceStatus): StatusType => {
    switch (status) {
      case ReserveComplianceStatus.COMPLIANT:
        return "success";
      case ReserveComplianceStatus.PENDING_REVIEW:
      case ReserveComplianceStatus.UNDER_INVESTIGATION:
      case ReserveComplianceStatus.NON_COMPLIANT:
        return "warning";
      default:
        return "warning";
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
      default:
        return status;
    }
  };

  const currentStatus = reserveStatus ?? ReserveComplianceStatus.PENDING_REVIEW;

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
          {lastAuditDate ? new Date(lastAuditDate).toLocaleDateString() : "-"}
        </p>
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm">
          {t("form.fields.audit-details.reserve-status")}
        </h3>
        <StatusPill
          status={getStatusConfig(currentStatus)}
          label={getStatusLabel(currentStatus)}
        />
      </div>
    </div>
  );
}
