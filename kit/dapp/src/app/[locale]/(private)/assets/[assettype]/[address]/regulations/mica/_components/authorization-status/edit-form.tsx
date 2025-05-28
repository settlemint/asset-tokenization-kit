"use client";

import { Form } from "@/components/blocks/form/form";
import { FormSheet } from "@/components/blocks/form/form-sheet";
import { FormInput } from "@/components/blocks/form/inputs/form-input";
import { Textarea } from "@/components/ui/textarea";
import type { MicaRegulationConfig } from "@/lib/db/regulations/schema-mica-regulation-configs";
import { updateAuthorization } from "@/lib/mutations/regulations/mica/update-authorization/update-authorization-action";
import { UpdateAuthorizationSchema } from "@/lib/mutations/regulations/mica/update-authorization/update-authorization-schema";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface AuthorizationFormProps {
  config: MicaRegulationConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthorizationForm({
  config,
  open,
  onOpenChange,
}: AuthorizationFormProps) {
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
            : "",
          approvalDetails: config.approvalDetails ?? "",
        }}
        hideStepProgress
      >
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
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("fields.additional-details.label")}
            </label>
            <p className="text-sm text-muted-foreground">
              {t("fields.additional-details.description")}
            </p>
            <Textarea name="approvalDetails" className="min-h-[100px]" />
          </div>
        </div>
      </Form>
    </FormSheet>
  );
}
