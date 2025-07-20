import { AssetBasics } from "@/components/asset-designer/asset-basics";
import { SelectAssetType } from "@/components/asset-designer/select-asset-type";
import {
  assetDesignerFormOptions,
  AssetDesignerFormSchema,
} from "@/components/asset-designer/shared-form";
import {
  useAssetDesignerSteps,
  type AssetDesignerStepsType,
} from "@/components/asset-designer/steps";
import { StepLayout } from "@/components/stepper/step-layout";
import { getNextStep, getStepById } from "@/components/stepper/utils";
import { useAppForm } from "@/hooks/use-app-form";
import { useStore } from "@tanstack/react-store";
import type { JSX } from "react";

export const AssetDesignerForm = () => {
  const steps = useAssetDesignerSteps();
  const form = useAppForm({
    ...assetDesignerFormOptions,
    validators: {
      onChange: AssetDesignerFormSchema,
    },
  });

  const stepId = useStore(form.store, (state) => state.values.step);
  const currentStep = getStepById(steps, stepId);
  const incrementStep = () => {
    const nextStep = getNextStep(steps, currentStep);
    form.setFieldValue("step", nextStep.id);
  };

  const stepComponent: Record<AssetDesignerStepsType, JSX.Element> = {
    selectAssetType: (
      <SelectAssetType form={form} onStepSubmit={incrementStep} />
    ),
    assetBasics: <AssetBasics form={form} onStepSubmit={incrementStep} />,
    summary: <div>Summary</div>,
  };

  return (
    <form.AppForm>
      <StepLayout
        stepsOrGroups={steps}
        currentStep={currentStep}
        onStepSelect={(step) => {
          form.setFieldValue("step", step.id);
        }}
        navigationMode="next-and-completed"
      >
        {({ currentStep }) => {
          return stepComponent[currentStep.id];
        }}
      </StepLayout>
    </form.AppForm>
  );
};
