import {
  BondFields,
  bondFields,
} from "@/components/asset-designer/asset-designer-wizard/asset-basics/bond";
import {
  CommonFields,
  commonFields,
} from "@/components/asset-designer/asset-designer-wizard/asset-basics/common";
import {
  FundFields,
  fundFields,
} from "@/components/asset-designer/asset-designer-wizard/asset-basics/fund";
import {
  assetDesignerFormOptions,
  isRequiredField,
} from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import { FormStepLayout } from "@/components/form/multi-step/form-step-layout";
import { Button } from "@/components/ui/button";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import { useStore } from "@tanstack/react-form";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const AssetBasics = withForm({
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
        return [...commonFields, ...bondFields];
      }
      if (assetType === "fund") {
        return [...commonFields, ...fundFields];
      }
      return commonFields;
    }, [assetType]);

    return (
      <FormStepLayout
        title={t("wizard.steps.assetBasics.title")}
        description={t("wizard.steps.assetBasics.description")}
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
        <CommonFields form={form} />
        {assetType === "bond" && <BondFields form={form} />}
        {assetType === "fund" && <FundFields form={form} />}
      </FormStepLayout>
    );
  },
});
