import type { StepOrGroup } from "@/components/stepper/types";
import type { Step, StepGroup } from "./types";

export function getStepById<StepId>(
  steps: Step<StepId>[],
  name: StepId
): Step<StepId> {
  const step = steps.find((s) => s.id === name);
  if (!step) {
    throw new Error("Step not found");
  }
  return step;
}

export function getStepByIndex<StepId>(
  steps: Step<StepId>[],
  index: number
): Step<StepId> {
  const step = steps[index];
  if (!step) {
    throw new Error("Step not found");
  }
  return step;
}

export function getStepIndex<StepId>(step: Step<StepId>): number {
  return step.step - 1;
}

export function getNextStepName<StepId>(
  steps: Step<StepId>[],
  currentStepName: StepId
): StepId {
  const currentStep = getStepById(steps, currentStepName);
  const currentStepIndex = getStepIndex(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  if (isLastStep) {
    return currentStep.id;
  }
  return getStepByIndex(steps, currentStepIndex + 1).id;
}

export function getNextStep<StepId>(
  steps: Step<StepId>[],
  currentStep: Step<StepId>
): Step<StepId> {
  const currentStepIndex = getStepIndex(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  if (isLastStep) {
    return currentStep;
  }
  return getStepByIndex(steps, currentStepIndex + 1);
}

export function isStepCompleted<StepId>(
  step: Step<StepId>,
  currentStep: Step<StepId>
): boolean {
  const stepIndex = getStepIndex(step);
  const currentStepIndex = getStepIndex(currentStep);

  return currentStepIndex > stepIndex;
}

export function isGroupCompleted<StepId, GroupId>(
  group: StepGroup<StepId, GroupId>,
  currentStep: Step<StepId>
): boolean {
  const lastStepInGroup = getStepByIndex(group.steps, group.steps.length - 1);

  const lastStepIndex = getStepIndex(lastStepInGroup);
  const currentStepIndex = getStepIndex(currentStep);

  return currentStepIndex > lastStepIndex;
}

export function flattenSteps<StepId, GroupId>(
  configs: readonly StepOrGroup<StepId, GroupId>[]
): Step<StepId>[] {
  return configs.reduce<Step<StepId>[]>((acc, config) => {
    if (isStepGroup(config)) {
      acc.push(...config.steps);
    } else {
      acc.push(config);
    }
    return acc;
  }, []);
}

export function isStepGroup<StepId, GroupId>(
  config: StepOrGroup<StepId, GroupId>
): config is StepGroup<StepId, GroupId> {
  return "steps" in config;
}
