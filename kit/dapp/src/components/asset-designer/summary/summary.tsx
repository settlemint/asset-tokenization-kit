import {
  assetDesignerFormOptions,
  AssetDesignerFormSchema,
} from "@/components/asset-designer/shared-form";
import {
  FormStep,
  FormStepContent,
  FormStepDescription,
  FormStepHeader,
  FormStepSubmit,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";
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
    const parsedValues = AssetDesignerFormSchema.safeParse(form.state.values);

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
            {JSON.stringify(parsedValues, (_, value) =>
              typeof value === "bigint" ? value.toString() : value
            )}
          </div>

          <form.Errors />
        </FormStepContent>

        <FormStepSubmit>
          <form.SubmitButton label="Submit" onSubmit={onSubmit} />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
