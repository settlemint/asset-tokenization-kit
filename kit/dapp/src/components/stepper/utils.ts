import type { StepOrGroup } from "@/components/stepper/types";
import type { Step, StepGroup } from "./types";

export function isStepGroup(config: StepOrGroup): config is StepGroup {
  return "steps" in config;
}

export function flattenSteps<
  StepName extends string = string,
  GroupName extends string = string,
>(configs: readonly StepOrGroup<StepName, GroupName>[]): Step<StepName>[] {
  return configs.reduce<Step<StepName>[]>((acc, config) => {
    if (isStepGroup(config)) {
      acc.push(...config.steps);
    } else {
      acc.push(config);
    }
    return acc;
  }, []);
}

export function findGroupContainingStep(
  configs: readonly Step[],
  stepId: number
): StepGroup | null {
  for (const config of configs) {
    if (
      isStepGroup(config) &&
      config.steps.some((step) => step.id === stepId)
    ) {
      return config;
    }
  }
  return null;
}

export function getStepIndex(step: Step): number {
  return step.id - 1;
}

export function getStepAtIndex(steps: Step[], index: number): Step {
  const step = steps[index];
  if (!step) {
    throw new Error("Step not found");
  }
  return step;
}

export function getNextStep(steps: Step[], currentStep: Step): Step {
  const currentStepIndex = getStepIndex(currentStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  if (isLastStep) {
    return currentStep;
  }
  return getStepAtIndex(steps, currentStepIndex + 1);
}

export function isGroupCompleted(group: StepGroup, currentStep: Step): boolean {
  const lastStepInGroup = getStepAtIndex(group.steps, group.steps.length - 1);

  const lastStepIndex = getStepIndex(lastStepInGroup);
  const currentStepIndex = getStepIndex(currentStep);

  return currentStepIndex > lastStepIndex;
}

export function isStepCompleted(step: Step, currentStep: Step): boolean {
  const stepIndex = getStepIndex(step);
  const currentStepIndex = getStepIndex(currentStep);

  return stepIndex < currentStepIndex;
}
