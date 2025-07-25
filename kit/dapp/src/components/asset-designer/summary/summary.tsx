import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";
import {
  FormStep,
  FormStepContent,
  FormStepDescription,
  FormStepHeader,
  FormStepSubmit,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";
import { VerificationDialog } from "@/components/verification-dialog/verification-dialog";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export const Summary = withForm({
  ...assetDesignerFormOptions,
  props: {
    onSubmit: noop,
  },
  render: function Render({ form, onSubmit }) {
    const { t } = useTranslation("asset-designer");
    const [showVerificationModal, setShowVerificationModal] = useState(false);

    const renderVerificationModal = () => {
      setShowVerificationModal(true);
    };
    return (
      <FormStep>
        <FormStepHeader>
          <FormStepTitle>{t("wizard.steps.summary.title")}</FormStepTitle>
          <FormStepDescription>
            {t("wizard.steps.summary.description")}
          </FormStepDescription>
        </FormStepHeader>
        <FormStepContent>
          <div>
            {JSON.stringify(form.state.values, (_, value) =>
              typeof value === "bigint" ? value.toString() : value
            )}
          </div>

          <form.Errors />
        </FormStepContent>

        <FormStepSubmit>
          <form.SubmitButton
            label="Submit"
            onSubmit={renderVerificationModal}
          />
          <VerificationDialog
            open={showVerificationModal}
            onOpenChange={setShowVerificationModal}
            onSubmit={async ({ verificationCode, verificationType }) => {
              form.setFieldValue("verification", {
                verificationCode,
                verificationType,
              });
              await form.validate("change");
              onSubmit();
            }}
            title={t("verification.confirm-title")}
            description={t("verification.confirm-description")}
          />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
