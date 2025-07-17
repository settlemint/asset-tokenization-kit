import type { StepOrGroup } from "@/components/stepper/types";
import { getElementAtIndex } from "@/lib/utils/array";
import type { Step, StepGroup } from "./types";

export function getStepById<StepId>(
  steps: Step<StepId>[],
  id: StepId
): Step<StepId> {
  const step = steps.find((s) => s.id === id);
  if (!step) {
    throw new Error(`Step with id ${id} not found`);
  }
  return step;
}

export function getNextStepId<StepId>(
  allSteps: Step<StepId>[],
  currentStepId: StepId
): StepId {
  const currentStep = getStepById(allSteps, currentStepId);
  const nextStep = getNextStep(allSteps, currentStep);
  return nextStep.id;
}

export function getNextStep<StepId>(
  allSteps: Step<StepId>[],
  currentStep: Step<StepId>
): Step<StepId> {
  const sortedSteps = sortByStep(allSteps);
  const currentIndex = sortedSteps.findIndex(
    (step) => step.id === currentStep.id
  );

  if (currentIndex === -1) {
    throw new Error(`Current step ${currentStep.id} not found in steps array`);
  }

  const isLastStep = currentIndex === sortedSteps.length - 1;
  if (isLastStep) {
    return currentStep;
  }

  const nextStep = getElementAtIndex(sortedSteps, currentIndex + 1);
  return nextStep;
}

export function getLastStep<StepId>(steps: Step<StepId>[]): Step<StepId> {
  const sortedSteps = sortByStep(steps);
  return getElementAtIndex(sortedSteps, sortedSteps.length - 1);
}

export function isStepCompleted<StepId>(
  step: Step<StepId>,
  currentStep: Step<StepId>
): boolean {
  return currentStep.step > step.step;
}

export function isGroupCompleted<StepId, GroupId>(
  group: StepGroup<StepId, GroupId>,
  currentStep: Step<StepId>
): boolean {
  const lastStepInGroup = getLastStep(group.steps);
  return isStepCompleted(lastStepInGroup, currentStep);
}

export function isStepGroup<StepId, GroupId>(
  item: StepOrGroup<StepId, GroupId>
): item is StepGroup<StepId, GroupId> {
  return "steps" in item;
}

export function sortByStep<StepId>(steps: Step<StepId>[]): Step<StepId>[] {
  return steps.sort((a, b) => a.step - b.step);
}

export function flattenSteps<StepId, GroupId>(
  stepOrGroup: readonly StepOrGroup<StepId, GroupId>[]
): Step<StepId>[] {
  return stepOrGroup.reduce<Step<StepId>[]>((acc, item) => {
    if (isStepGroup(item)) {
      acc.push(...item.steps);
    } else {
      acc.push(item);
    }
    return acc;
  }, []);
}
