"use client";

import { FormStep } from "@/components/blocks/form/form-step";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormSelect } from "@/components/blocks/form/inputs/form-select";
import { ReserveComplianceStatus } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export function AuditDetails() {
  const t = useTranslations(
    "regulations.mica.dashboard.reserve-status.form.fields.audit-details"
  );
  const form = useFormContext();

  return (
    <FormStep
      title={t("title")}
      description={t("description")}
      contentClassName="space-y-4"
    >
      <FormInput
        control={form.control}
        name="lastAuditDate"
        type="datetime-local"
        label={t("last-audit-date")}
        placeholder={t("last-audit-date-placeholder")}
        max={new Date().toISOString().slice(0, 16)}
      />

      <FormSelect
        control={form.control}
        name="reserveStatus"
        label={t("reserve-status")}
        placeholder={t("reserve-status-placeholder")}
        className="w-full"
        options={[
          {
            label: t("status.compliant"),
            value: ReserveComplianceStatus.COMPLIANT,
          },
          {
            label: t("status.pending-review"),
            value: ReserveComplianceStatus.PENDING_REVIEW,
          },
          {
            label: t("status.under-investigation"),
            value: ReserveComplianceStatus.UNDER_INVESTIGATION,
          },
          {
            label: t("status.non-compliant"),
            value: ReserveComplianceStatus.NON_COMPLIANT,
          },
        ]}
      />
    </FormStep>
  );
}
