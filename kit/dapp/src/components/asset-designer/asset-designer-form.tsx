import { AssetBasics } from "@/components/asset-designer/asset-basics";
import { SelectAssetType } from "@/components/asset-designer/select-asset-type";
import { type AssetDesignerFormData } from "@/components/asset-designer/shared-form";
import { useAssetDesignerSteps } from "@/components/asset-designer/steps";
import { StepLayout } from "@/components/stepper/step-layout";
import { getNextStep, getStepById } from "@/components/stepper/utils";
import { Store } from "@tanstack/react-store";

const store = new Store({
  step: "selectAssetType",
} as AssetDesignerFormData);

export const AssetDesignerForm = () => {
  const steps = useAssetDesignerSteps();

  const stepId = store.state.step;
  const currentStep = getStepById(steps, stepId);
  const updateStep = () => {
    const nextStep = getNextStep(steps, currentStep);
    store.setState((state) => ({ ...state, step: nextStep.id }));
  };

  return (
    <StepLayout
      stepsOrGroups={steps}
      currentStep={currentStep}
      onStepSelect={(step) => {
        store.setState((state) => ({ ...state, step: step.id }));
      }}
      navigationMode="next-and-completed"
    >
      {({ currentStep }) => {
        return (
          <>
            {currentStep.id === "selectAssetType" && (
              <SelectAssetType
                onGroupSubmit={() => {
                  updateStep();
                }}
                store={store}
              />
            )}
            {currentStep.id === "assetBasics" && (
              <AssetBasics
                onGroupSubmit={() => {
                  updateStep();
                }}
                store={store}
              />
            )}
          </>
        );
      }}
    </StepLayout>
  );
};
