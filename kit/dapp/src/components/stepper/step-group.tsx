import { StepItem } from "@/components/stepper/step-item";
import type {
  NavigationMode,
  Step,
  StepGroup,
} from "@/components/stepper/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Timeline } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  calculateLineHeight,
  getCurrentStepIndex,
  isGroupCompleted,
  isStepCompleted,
} from "./utils";

export interface StepGroupProps<StepId, GroupId> {
  group: StepGroup<StepId, GroupId>;
  currentStep: Step<StepId>;
  allSteps: Step<StepId>[];
  navigation: NavigationMode;
  onStepSelect: (step: Step<StepId>) => void;
}

export function StepGroupComponent<StepId, GroupId>({
  group,
  currentStep,
  allSteps,
  navigation,
  onStepSelect,
}: StepGroupProps<StepId, GroupId>) {
  const hasActiveStep = group.steps.some((step) => step.id === currentStep.id);
  const [expandedGroup, setExpandedGroup] = useState<string | undefined>(
    hasActiveStep ? String(group.id) : undefined
  );
  const groupCompleted = isGroupCompleted(group, currentStep);
  const currentStepIndex = getCurrentStepIndex(allSteps, currentStep);

  // Memoized helper function to get step status
  const getStepStatus = useCallback(
    (step: Step<StepId>, index: number) => {
      if (index === currentStepIndex) return "current";
      if (isStepCompleted({ step, currentStep })) return "completed";
      return "pending";
    },
    [currentStepIndex, currentStep]
  );

  // Memoized helper function to check if we can navigate to a step
  const canNavigateToStep = useCallback(
    (index: number) => {
      const isCurrent = index === currentStepIndex;
      const isCompleted = index < currentStepIndex;
      return isCurrent || (isCompleted && navigation === "next-and-completed");
    },
    [currentStepIndex, navigation]
  );

  // Memoized helper function to navigate to a step
  const navigateToStep = useCallback(
    (stepId: StepId) => {
      const step = group.steps.find((s) => s.id === stepId);
      if (step) {
        onStepSelect(step);
      }
    },
    [group.steps, onStepSelect]
  );

  useEffect(() => {
    if (hasActiveStep) {
      setExpandedGroup(String(group.id));
    }
  }, [hasActiveStep, group.id]);

  useEffect(() => {
    if (groupCompleted) {
      setExpandedGroup(undefined);
    }
  }, [groupCompleted]);

  // Memoized computation of group steps with their indices
  const groupSteps = useMemo(
    () =>
      group.steps.map((step) => ({
        step,
        index: allSteps.findIndex((s) => s.id === step.id),
      })),
    [group.steps, allSteps]
  );

  return (
    <div className="StepGroup">
      <Accordion
        type="single"
        collapsible
        className="w-full !bg-transparent"
        style={{ background: "transparent" }}
        value={expandedGroup || ""}
        onValueChange={setExpandedGroup}
      >
        <AccordionItem
          value={String(group.id)}
          className="border-b-0 bg-transparent"
        >
          <AccordionTrigger
            className={cn(
              "justify-start text-left mb-3 p-2 rounded-lg transition-all duration-200 hover:bg-primary-foreground/10 hover:no-underline [&>svg]:hidden",
              hasActiveStep && "bg-primary-foreground/5"
            )}
          >
            <div className="flex flex-col w-full text-left">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className={cn(
                    "text-base font-bold transition-all duration-300",
                    hasActiveStep
                      ? "text-primary-foreground"
                      : "text-primary-foreground/70"
                  )}
                >
                  {group.label}
                </h3>
                {groupCompleted && (
                  <Check className="w-4 h-4 text-sm-state-success" />
                )}
              </div>
              {group.description && (
                <p className="text-xs text-primary-foreground/50">
                  {group.description}
                </p>
              )}
            </div>
          </AccordionTrigger>

          <AccordionContent className="pl-2 bg-transparent">
            <Timeline className="ml-4 space-y-3">
              {groupSteps.map(({ step, index }, stepIndex) => {
                const status = getStepStatus(step, index);
                const isCurrent = index === currentStepIndex;
                const isCompleted = status === "completed";
                const isAccessible = canNavigateToStep(index);
                const isLastInGroup = stepIndex === groupSteps.length - 1;
                const dynamicHeight = calculateLineHeight(step.description);

                return (
                  <StepItem
                    key={String(step.id)}
                    step={step}
                    stepIndex={stepIndex}
                    isCurrent={isCurrent}
                    isCompleted={isCompleted}
                    isAccessible={isAccessible}
                    isLast={isLastInGroup}
                    dynamicHeight={dynamicHeight}
                    onStepSelect={(selectedStep) => {
                      navigateToStep(selectedStep.id);
                    }}
                  />
                );
              })}
            </Timeline>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
