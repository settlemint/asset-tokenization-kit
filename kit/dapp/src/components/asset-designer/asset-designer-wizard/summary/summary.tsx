import { assetDesignerFormOptions } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { OnboardingStepLayout } from "@/components/onboarding/onboarding-step-layout";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import { useTranslation } from "react-i18next";

export const Summary = withForm({
  ...assetDesignerFormOptions,
  props: {
    onSubmit: noop,
  },
  render: function Render({ form, onSubmit }) {
    const { t } = useTranslation("asset-designer");

    return (
      <OnboardingStepLayout
        title={t("wizard.steps.summary.title")}
        description={t("wizard.steps.summary.description")}
        actions={
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
        }
      >
        <div>
          {JSON.stringify(form.state.values, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          )}
        </div>

        <form.Errors />
      </OnboardingStepLayout>
    );
  },
});
