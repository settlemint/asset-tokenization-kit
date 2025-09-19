import {
  assetDesignerFormOptions,
  isRequiredField,
} from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import {
  BondFields,
  bondFields,
} from "@/components/asset-designer/asset-designer-wizard/asset-specific-details/bond";
import {
  equityFields,
  EquityFields,
} from "@/components/asset-designer/asset-designer-wizard/asset-specific-details/equity";
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
    const type = useStore(form.store, (state) => state.values.type);
    const validateFields = useMemo(() => {
      if (type === "bond") {
        return bondFields;
      }
      if (type === "fund") {
        return fundFields;
      }
      if (type === "equity") {
        return equityFields;
      }
      return [];
    }, [type]);

    return (
      <FormStepLayout
        title={t("wizard.steps.assetSpecificConfig.title")}
        description={t("wizard.steps.assetSpecificConfig.description", {
          type,
        })}
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
        asGrid
      >
        {type === "bond" && <BondFields form={form} />}
        {type === "fund" && <FundFields form={form} />}
        {type === "equity" && <EquityFields form={form} />}
      </FormStepLayout>
    );
  },
});
