import { BondBasics } from "@/components/asset-designer/asset-designer-wizard/asset-basics/bond";
import { CommonBasics } from "@/components/asset-designer/asset-designer-wizard/asset-basics/common";
import { FundBasics } from "@/components/asset-designer/asset-designer-wizard/asset-basics/fund";
import { assetDesignerFormOptions } from "@/components/asset-designer/asset-designer-wizard/asset-designer-form";
import {
  FormStep,
  FormStepDescription,
  FormStepHeader,
  FormStepTitle,
} from "@/components/form/multi-step/form-step";
import { withForm } from "@/hooks/use-app-form";
import { noop } from "@/lib/utils/noop";
import { useStore } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";

export const AssetBasics = withForm({
  ...assetDesignerFormOptions,
  props: {
    onStepSubmit: noop,
  },
  render: function Render({ form, onStepSubmit }) {
    const assetType = useStore(form.store, (state) => state.values.type);

    if (assetType === "bond") {
      return (
        <AssetBasicsStep>
          <BondBasics form={form} onStepSubmit={onStepSubmit} />
        </AssetBasicsStep>
      );
    }
    if (assetType === "fund") {
      return (
        <AssetBasicsStep>
          <FundBasics form={form} onStepSubmit={onStepSubmit} />
        </AssetBasicsStep>
      );
    }

    return (
      <AssetBasicsStep>
        <CommonBasics form={form} onStepSubmit={onStepSubmit} />
      </AssetBasicsStep>
    );
  },
});

const AssetBasicsStep = ({ children }: { children: React.ReactNode }) => {
  const { t } = useTranslation(["asset-designer"]);

  return (
    <FormStep>
      <FormStepHeader>
        <FormStepTitle>{t("wizard.steps.assetBasics.title")}</FormStepTitle>
        <FormStepDescription>
          {t("wizard.steps.assetBasics.description")}
        </FormStepDescription>
      </FormStepHeader>
      {children}
    </FormStep>
  );
};
