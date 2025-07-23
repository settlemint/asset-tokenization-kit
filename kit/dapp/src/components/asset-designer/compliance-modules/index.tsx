// TODO: initialModulePairs can also be undefined, but the linting is saying it's always a non nullish value

import { assetDesignerFormOptions } from "@/components/asset-designer/shared-form";
import { ComplianceModulesGrid } from "@/components/compliance-modules-grid";
import {
  FormStep,
  FormStepContent,
  FormStepDescription,
  FormStepSubmit,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";

import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import { complianceTypeIds } from "@/lib/zod/validators/compliance";
import { useTranslation } from "react-i18next";

const validate: never[] = [];

export const ComplianceModules = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    const { t } = useTranslation("asset-designer");

    return (
      <FormStep>
        <FormStepTitle>{t("compliance.title")}</FormStepTitle>
        <FormStepDescription>{t("compliance.description")}</FormStepDescription>
        <FormStepContent>
          <ComplianceModulesGrid
            complianceTypeIds={complianceTypeIds}
            onModuleSelect={noop}
          />
        </FormStepContent>
        <FormStepSubmit>
          <form.StepSubmitButton
            label={t("form.buttons.next")}
            onStepSubmit={onStepSubmit}
            validate={validate}
            checkRequiredFn={() => false}
          />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
