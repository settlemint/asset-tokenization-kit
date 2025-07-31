import { assetDesignerFormOptions } from "@/components/asset-designer/asset-designer-wizard/shared-form";
import { ComplianceModules } from "@/components/compliance/compliance-modules";
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
import { ComplianceModulePairInput } from "@/lib/zod/validators/compliance";
import { ComplianceModulesList } from "@/orpc/routes/system/compliance-module/routes/compliance-module.list.schema";
import { useStore } from "@tanstack/react-store";
import { useTranslation } from "react-i18next";

const empty: never[] = [];

export const SelectComplianceModules = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
    complianceModules: [] as ComplianceModulesList,
  },
  render: function Render({ form, onStepSubmit, complianceModules }) {
    const { t } = useTranslation("asset-designer");

    const initialModulePairs = useStore(
      form.store,
      (state) => state.values.initialModulePairs
    );

    const addModulePair = (modulePair: ComplianceModulePairInput) => {
      const modulePairsWithoutType = initialModulePairs?.filter(
        (pair) => pair.typeId !== modulePair.typeId
      );
      form.setFieldValue("initialModulePairs", () => {
        return [...(modulePairsWithoutType ?? []), modulePair];
      });
    };

    const removeModulePair = (modulePair: ComplianceModulePairInput) => {
      form.setFieldValue("initialModulePairs", () => {
        return initialModulePairs?.filter(
          (pair) => pair.typeId !== modulePair.typeId
        );
      });
    };

    return (
      <FormStep>
        <FormStepHeader>
          <FormStepTitle>{t("compliance.title")}</FormStepTitle>
          <FormStepDescription>
            {t("compliance.description")}
          </FormStepDescription>
        </FormStepHeader>
        <FormStepContent>
          <ComplianceModules
            allModules={complianceModules}
            enabledModules={initialModulePairs}
            onEnable={addModulePair}
            onDisable={removeModulePair}
          />
        </FormStepContent>
        <FormStepSubmit>
          <form.StepSubmitButton
            label={t("form.buttons.next")}
            onStepSubmit={onStepSubmit}
            validate={empty}
          />
        </FormStepSubmit>
      </FormStep>
    );
  },
});
