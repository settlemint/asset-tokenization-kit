import {
  assetDesignerFormOptions,
  isRequiredField,
} from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import {
  BondFields,
  bondFields,
} from "@/components/asset-designer/asset-designer-wizard/asset-specific-details/bond";
import {
  FundFields,
  fundFields,
} from "@/components/asset-designer/asset-designer-wizard/asset-specific-details/fund";
import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import { useStore } from "@tanstack/react-form";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const AssetSpecificDetails = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
    onBack: noop,
  },
  render: function Render({ form, onStepSubmit, onBack }) {
    const { t } = useTranslation(["asset-designer"]);
    const assetType = useStore(form.store, (state) => state.values.type);
    const validateFields = useMemo(() => {
      if (assetType === "bond") {
        return bondFields;
      }
      if (assetType === "fund") {
        return fundFields;
      }
      return [];
    }, [assetType]);

    return (
      <FormStepLayout
        title={t("wizard.steps.assetSpecificConfig.title")}
        description={t("wizard.steps.assetSpecificConfig.description")}
        actions={
          <>
            <Button variant="outline" onClick={onBack}>
              {t("form.buttons.back")}
            </Button>
            <form.StepSubmitButton
              label={t("form.buttons.next")}
              onStepSubmit={onStepSubmit}
              validate={validateFields}
              checkRequiredFn={isRequiredField}
            />
          </>
        }
      >
        {assetType === "bond" && <BondFields form={form} />}
        {assetType === "fund" && <FundFields form={form} />}
      </FormStepLayout>
    );
  },
});
