import { StepItem } from "@/components/stepper/step-item";
import type {
  NavigationMode,
  Step,
  StepGroup,
} from "@/components/stepper/types";
import {
  calculateLineHeight,
  isLastStepInGroup,
  isStepCompleted,
} from "@/components/stepper/utils";
import { Timeline } from "@/components/ui/timeline";
import { isLastStep } from "./utils";

export interface StepItemProps<StepId, GroupId> {
  step: Step<StepId>;
  currentStep: Step<StepId>;
  allSteps: Step<StepId>[];
  navigation: NavigationMode;
  onStepSelect: (step: Step<StepId>) => void;
  group?: StepGroup<StepId, GroupId>;
}

export function StepComponent<StepId, GroupId>({
  step,
  currentStep,
  allSteps,
  navigation,
  onStepSelect,
  group,
}: StepItemProps<StepId, GroupId>) {
  const stepIndex = allSteps.findIndex((s) => s.id === step.id);
  const isCurrent = step.id === currentStep.id;
  const isCompleted = isStepCompleted({ step, currentStep });
  const isAccessible =
    isCurrent || (isCompleted && navigation === "next-and-completed");
  const isLast = group
    ? isLastStepInGroup(group, step)
    : isLastStep(allSteps, step);

  const dynamicHeight = calculateLineHeight(step.description);

  return (
    <Timeline className="space-y-3">
      <StepItem
        step={step}
        stepIndex={stepIndex}
        isCurrent={isCurrent}
        isCompleted={isCompleted}
        isAccessible={isAccessible}
        isLast={isLast}
        dynamicHeight={dynamicHeight}
        onStepSelect={onStepSelect}
      />
    </Timeline>
  );
}
