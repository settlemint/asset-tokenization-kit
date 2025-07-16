import { AssetBasics } from "@/components/asset-designer/asset-basics";
import { SelectAssetType } from "@/components/asset-designer/select-asset-type";
import {
  assetDesignerFormOptions,
  AssetDesignerFormSchema,
} from "@/components/asset-designer/shared-form";
import {
  steps,
  type AssetDesignerStepsType,
} from "@/components/asset-designer/steps";
import { StepLayout } from "@/components/stepper/step-layout";
import { getStepByName } from "@/components/stepper/utils";
import { useAppForm } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-store";
import type { JSX } from "react";

export const AssetDesignerForm = () => {
  const form = useAppForm({
    ...assetDesignerFormOptions,
    validators: {
      onChange: (values) => {
        try {
          const parseResult = AssetDesignerFormSchema.safeParse(values);
          return parseResult.success;
        } catch {
          return false;
        }
      },
    },
  });

  const step = useStore(form.store, (state) => state.values.step);
  const stepComponent: Record<AssetDesignerStepsType, JSX.Element> = {
    selectAssetType: <SelectAssetType form={form} />,
    assetBasics: <AssetBasics form={form} />,
    summary: <div>Summary</div>,
  };
  const currentStep = getStepByName(steps, step);

  return (
    <form.AppForm>
      <StepLayout
        stepsOrGroups={steps}
        currentStep={currentStep}
        onStepChange={(step) => {
          form.setFieldValue("step", step.name);
        }}
        navigation="bidirectional"
      >
        {({ currentStep }) => {
          return stepComponent[currentStep.name];
        }}
      </StepLayout>
    </form.AppForm>
  );
};
