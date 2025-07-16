import type { StepOrGroup } from "@/components/stepper/types";
import type { Step, StepGroup } from "./types";

export function getStepByName<StepName>(
  steps: Step<StepName>[],
  name: StepName
): Step<StepName> {
  const step = steps.find((s) => s.name === name);
  if (!step) {
    throw new Error("Step not found");
  }
  return step;
}

export function getStepByIndex<StepName>(
  steps: Step<StepName>[],
  index: number
): Step<StepName> {
  const step = steps[index];
  if (!step) {
    throw new Error("Step not found");
  }
  return step;
}

export function getStepIndex<StepName>(step: Step<StepName>): number {
  return step.id - 1;
}

export function getNextStepName<StepName>(
  steps: Step<StepName>[],
  currentStepName: StepName
): StepName {
  const currentStep = getStepByName(steps, currentStepName);
  const currentStepIndex = getStepIndex(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  if (isLastStep) {
    return currentStep.name;
  }
  return getStepByIndex(steps, currentStepIndex + 1).name;
}

export function getNextStep<StepName>(
  steps: Step<StepName>[],
  currentStep: Step<StepName>
): Step<StepName> {
  const currentStepIndex = getStepIndex(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  if (isLastStep) {
    return currentStep;
  }
  return getStepByIndex(steps, currentStepIndex + 1);
}

export function isStepCompleted<StepName>(
  step: Step<StepName>,
  currentStep: Step<StepName>
): boolean {
  const stepIndex = getStepIndex(step);
  const currentStepIndex = getStepIndex(currentStep);

  return stepIndex < currentStepIndex;
}

export function isGroupCompleted<StepName, GroupName>(
  group: StepGroup<StepName, GroupName>,
  currentStep: Step<StepName>
): boolean {
  const lastStepInGroup = getStepByIndex(group.steps, group.steps.length - 1);

  const lastStepIndex = getStepIndex(lastStepInGroup);
  const currentStepIndex = getStepIndex(currentStep);

  return currentStepIndex > lastStepIndex;
}

export function flattenSteps<StepName, GroupName>(
  configs: readonly StepOrGroup<StepName, GroupName>[]
): Step<StepName>[] {
  return configs.reduce<Step<StepName>[]>((acc, config) => {
    if (isStepGroup(config)) {
      acc.push(...config.steps);
    } else {
      acc.push(config);
    }
    return acc;
  }, []);
}

export function isStepGroup<StepName, GroupName>(
  config: StepOrGroup<StepName, GroupName>
): config is StepGroup<StepName, GroupName> {
  return "steps" in config;
}
