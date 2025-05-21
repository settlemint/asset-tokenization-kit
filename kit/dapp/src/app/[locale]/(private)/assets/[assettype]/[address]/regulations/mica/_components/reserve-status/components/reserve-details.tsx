"use client";

import { Badge } from "@/components/ui/badge";
import { ReserveComplianceStatus } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { formatDate } from "@/lib/utils/date";
import { useLocale } from "next-intl";

interface ReserveDetailsProps {
  lastAuditDate: string;
  reserveStatus: ReserveComplianceStatus;
}

export function ReserveDetails({
  lastAuditDate,
  reserveStatus,
}: ReserveDetailsProps) {
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
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getStatusLabel = (status: ReserveComplianceStatus) => {
    switch (status) {
      case ReserveComplianceStatus.COMPLIANT:
        return "Compliant";
      case ReserveComplianceStatus.PENDING_REVIEW:
        return "Pending Review";
      case ReserveComplianceStatus.UNDER_INVESTIGATION:
        return "Under Investigation";
      case ReserveComplianceStatus.NON_COMPLIANT:
        return "Non-Compliant";
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h3 className="text-muted-foreground text-sm">Circulating Supply</h3>
        <p>1,000,000</p>
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm">Reserve Value</h3>
        <p>1,500,000</p>
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm">Last Audit Date</h3>
        <p>
          {formatDate(new Date(lastAuditDate), {
            type: "absolute",
            locale: locale,
          })}
        </p>
      </div>
      <div>
        <h3 className="text-muted-foreground text-sm">Compliance Status</h3>
        <Badge className={getStatusColor(reserveStatus)}>
          {getStatusLabel(reserveStatus)}
        </Badge>
      </div>
    </div>
  );
}
