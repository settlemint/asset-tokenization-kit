import type { StepOrGroup } from "@/components/stepper/types";
import { getElementAtIndex } from "@/lib/utils/array";
import type { Step, StepGroup } from "./types";

export function getStepById<StepId, Steps extends Step<StepId>[]>(
  steps: Steps,
  id: Steps[number]["id"]
): Steps[number] {
  const step = steps.find((s) => s.id === id);
  if (!step) {
    throw new Error(`Step with id ${id} not found`);
  }
  return step;
}

export function getNextStepId<StepId, Steps extends Step<StepId>[]>(
  allSteps: Steps,
  currentStepId: Steps[number]["id"]
): Steps[number]["id"] {
  const currentStep = getStepById(allSteps, currentStepId);
  const nextStep = getNextStep(allSteps, currentStep);
  return nextStep.id;
}

export function getNextStep<StepId, Steps extends Step<StepId>[]>(
  allSteps: Steps,
  currentStep: Steps[number]
): Steps[number] {
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

export function getPreviousStepId<StepId, Steps extends Step<StepId>[]>(
  allSteps: Steps,
  currentStepId: Steps[number]["id"]
): Steps[number]["id"] {
  const currentStep = getStepById(allSteps, currentStepId);
  const previousStep = getPreviousStep(allSteps, currentStep);
  return previousStep.id;
}

export function getPreviousStep<StepId, Steps extends Step<StepId>[]>(
  allSteps: Steps,
  currentStep: Steps[number]
): Steps[number] {
  const sortedSteps = sortByStep(allSteps);
  const currentIndex = sortedSteps.findIndex(
    (step) => step.id === currentStep.id
  );

  if (currentIndex === -1) {
    throw new Error(`Current step ${currentStep.id} not found in steps array`);
  }

  const isFirstStep = currentIndex === 0;
  if (isFirstStep) {
    return currentStep;
  }

  const previousStep = getElementAtIndex(sortedSteps, currentIndex - 1);
  return previousStep;
}

export function getLastStep<StepId, Steps extends Step<StepId>[]>(
  steps: Steps
): Steps[number] {
  const sortedSteps = sortByStep(steps);
  return getElementAtIndex(sortedSteps, sortedSteps.length - 1);
}

export function isLastStep<StepId, Steps extends Step<StepId>[]>(
  steps: Steps,
  step: Steps[number]
): boolean {
  const lastStep = getLastStep(steps);
  return step.step === lastStep.step;
}

export function isStepCompleted<StepId>({
  step,
  currentStep,
}: {
  step: Step<StepId>;
  currentStep: Step<StepId>;
}): boolean {
  return step.step < currentStep.step;
}

export function isGroupCompleted<StepId, GroupId>(
  group: StepGroup<StepId, GroupId>,
  currentStep: Step<StepId>
): boolean {
  const lastStepInGroup = getLastStep(group.steps);
  return isStepCompleted({ step: lastStepInGroup, currentStep });
}

export function isLastStepInGroup<StepId, GroupId>(
  group: StepGroup<StepId, GroupId>,
  step: Step<StepId>
): boolean {
  const lastStepInGroup = getLastStep(group.steps);
  return step.step === lastStepInGroup.step;
}

export function isStepGroup<StepId, GroupId>(
  item: StepOrGroup<StepId, GroupId>
): item is StepGroup<StepId, GroupId> {
  return "steps" in item;
}

export function sortByStep<StepId>(steps: Step<StepId>[]): Step<StepId>[] {
  return steps.toSorted((a, b) => a.step - b.step);
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

export function getCurrentStepIndex<StepId, Steps extends Step<StepId>[]>(
  allSteps: Steps,
  currentStep: Steps[number]
): number {
  return allSteps.findIndex((step) => step.id === currentStep.id);
}

export function getProgress<StepId, Steps extends Step<StepId>[]>(
  allSteps: Steps,
  currentStep: Steps[number]
): number {
  if (allSteps.length === 0) {
    return 0;
  }

  const currentStepIndex = getCurrentStepIndex(allSteps, currentStep);
  return Math.round(((currentStepIndex + 1) / allSteps.length) * 100);
}

// Constants for timeline height calculation
const TIMELINE_HEIGHT_CONFIG = {
  BASE_HEIGHT: 60,
  CHARACTERS_PER_LINE: 50,
  MAX_EXTRA_LINES: 3,
  EXTRA_LINE_HEIGHT: 20,
} as const;

/**
 * Calculates dynamic height for timeline separators based on description length.
 * Uses a base height and adds extra height based on description length.
 */
export function calculateLineHeight(description?: string): number {
  if (!description) return TIMELINE_HEIGHT_CONFIG.BASE_HEIGHT;

  const extraHeight =
    Math.min(
      description.length / TIMELINE_HEIGHT_CONFIG.CHARACTERS_PER_LINE,
      TIMELINE_HEIGHT_CONFIG.MAX_EXTRA_LINES
    ) * TIMELINE_HEIGHT_CONFIG.EXTRA_LINE_HEIGHT;

  return TIMELINE_HEIGHT_CONFIG.BASE_HEIGHT + extraHeight;
}
