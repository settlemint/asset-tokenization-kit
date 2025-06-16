"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { FormTextarea } from "@/components/blocks/form/inputs/form-textarea";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { updateAuthorization } from "@/lib/mutations/regulations/mica/update-authorization/update-authorization-action";
import { UpdateAuthorizationSchema } from "@/lib/mutations/regulations/mica/update-authorization/update-authorization-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { toast } from "sonner";

interface EditFormProps {
  config: MicaRegulationConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditForm({ config, open, onOpenChange }: EditFormProps) {
  const t = useTranslations(
    "regulations.mica.dashboard.authorization-status.form"
  );

  return (
    <FormSheet
      title={t("title")}
      description={t("description")}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Form
        action={updateAuthorization}
        resolver={typeboxResolver(UpdateAuthorizationSchema())}
        buttonLabels={{
          label: t("save"),
          submittingLabel: t("saving"),
          processingLabel: t("saving"),
        }}
        onSuccess={() => {
          toast.success(t("success"));
          onOpenChange(false);
        }}
        defaultValues={{
          regulationId: config.id,
          licenceNumber: config.licenceNumber ?? "",
          regulatoryAuthority: config.regulatoryAuthority ?? "",
          approvalDate: config.approvalDate
            ? new Date(config.approvalDate).toISOString().split("T")[0]
            : null,
          approvalDetails: config.approvalDetails ?? "",
        }}
        hideStepProgress
      >
        <FormFields />
      </Form>
    </FormSheet>
  );
}

function FormFields() {
  const t = useTranslations(
    "regulations.mica.dashboard.authorization-status.form"
  );
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <FormInput
        name="licenceNumber"
        label={t("fields.licence-number.label")}
        description={t("fields.licence-number.description")}
      />
      <FormInput
        name="regulatoryAuthority"
        label={t("fields.regulatory-authority.label")}
        description={t("fields.regulatory-authority.description")}
      />
      <FormInput
        type="date"
        name="approvalDate"
        label={t("fields.approval-date.label")}
        description={t("fields.approval-date.description")}
        max={new Date().toISOString().split("T")[0]}
        onChange={(e) => {
          if (e.target.value === "") {
            form.setValue("approvalDate", null);
          }
        }}
      />
      <FormTextarea
        name="approvalDetails"
        label={t("fields.additional-details.label")}
        description={t("fields.additional-details.description")}
        className="min-h-[100px]"
      />
    </div>
  );
}
