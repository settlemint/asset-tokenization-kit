import { assetDesignerFormOptions } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import { useTranslation } from "react-i18next";

export const Summary = withForm({
  ...assetDesignerFormOptions,
  props: {
    onSubmit: noop,
    onBack: noop,
  },
  render: function Render({ form, onSubmit, onBack }) {
    const { t } = useTranslation("asset-designer");

    return (
      <FormStepLayout
        title={t("wizard.steps.summary.title")}
        description={t("wizard.steps.summary.description")}
        actions={
          <>
            <Button variant="outline" onClick={onBack}>
              {t("form.buttons.back")}
            </Button>
            <form.VerificationButton
              onSubmit={onSubmit}
              verification={{
                title: t("verification.confirm-title"),
                description: t("verification.confirm-description"),
                setField: (verification) => {
                  form.setFieldValue("verification", verification);
                },
              }}
            >
              {t("form.actions.create")}
            </form.VerificationButton>
          </>
        }
      >
        <div>
          {JSON.stringify(form.state.values, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          )}
        </div>

        <form.Errors />
      </FormStepLayout>
    );
  },
});
