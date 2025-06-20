import { useCallback } from "react";

/**
 * Hook to synchronize steps between Form component and parent component
 *
 * This hook handles the bidirectional synchronization of steps between
 * the Form component (which manages steps internally) and a parent component
 * like AssetDesignerDialog that needs to control navigation.
 */
export function useFormStepSync({
  currentStepId,
  stepIdToIndex,
  onNextStep,
  onPrevStep,
}: {
  currentStepId: string;
  stepIdToIndex: Record<string, number>;
  onNextStep: () => void;
  onPrevStep: () => void;
}) {
  // Calculate current step index based on ID
  const currentStepIndex = stepIdToIndex[currentStepId] ?? 0;

  // Notify parent when form's internal step changes
  const handleStepChange = useCallback(
    (newStepIndex: number) => {
      // Map step index back to step ID
      const stepId = Object.entries(stepIdToIndex).find(
        ([_, index]) => index === newStepIndex
      )?.[0];

      // Notify parent of step change
      if (stepId && stepId !== currentStepId) {
        if (newStepIndex > currentStepIndex) {
          onNextStep();
        } else {
          onPrevStep();
        }
      }
    },
    [currentStepId, currentStepIndex, onNextStep, onPrevStep, stepIdToIndex]
  );

  // Keep Form's internal step in sync with parent
  const handleAnyFieldChange = useCallback(
    (
      _: any,
      context: {
        step: number;
        goToStep: (step: number) => void;
        changedFieldName?: string;
      }
    ) => {
      // If the parent step doesn't match Form's internal step, update Form's step
      if (context.step !== currentStepIndex && currentStepIndex >= 0) {
        context.goToStep(currentStepIndex);
      }
    },
    [currentStepIndex]
  );

  return {
    currentStepIndex,
    isLastStep: currentStepIndex === Object.keys(stepIdToIndex).length - 1,
    onStepChange: handleStepChange,
    onAnyFieldChange: handleAnyFieldChange,
  };
}
