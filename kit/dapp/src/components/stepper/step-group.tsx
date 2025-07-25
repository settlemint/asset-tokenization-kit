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
import {
  Timeline,
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import {
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
  const [expandedGroup, setExpandedGroup] = useState<string | undefined>();
  const hasActiveStep = group.steps.some((step) => step.id === currentStep.id);
  const groupCompleted = isGroupCompleted(group, currentStep);
  const currentStepIndex = getCurrentStepIndex(allSteps, currentStep);

  // Helper function to calculate dynamic height for timeline separators
  const calculateLineHeight = (description?: string) => {
    if (!description) return 60;
    const baseHeight = 60;
    const extraHeight = Math.min(description.length / 50, 3) * 20;
    return baseHeight + extraHeight;
  };

  // Helper function to get step status
  const getStepStatus = (step: Step<StepId>, index: number) => {
    if (index === currentStepIndex) return "current";
    if (isStepCompleted({ step, currentStep })) return "completed";
    return "pending";
  };

  // Helper function to check if we can navigate to a step
  const canNavigateToStep = (index: number) => {
    const isCurrent = index === currentStepIndex;
    const isCompleted = index < currentStepIndex;
    return isCurrent || (isCompleted && navigation === "next-and-completed");
  };

  // Helper function to navigate to a step
  const navigateToStep = (stepId: StepId) => {
    const step = group.steps.find((s) => s.id === stepId);
    if (step) {
      onStepSelect(step);
    }
  };

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

  const groupSteps = group.steps.map((step) => ({
    step,
    index: allSteps.findIndex((s) => s.id === step.id),
  }));

  return (
    <div className="StepGroup">
      <Accordion
        type="single"
        collapsible
        className="w-full bg-transparent"
        style={{ background: "transparent", boxShadow: "none" }}
        value={expandedGroup}
        onValueChange={setExpandedGroup}
      >
        <AccordionItem
          value={String(group.id)}
          className="border-b-0 bg-transparent"
        >
          <AccordionTrigger
            className={cn(
              "justify-start text-left mb-3 p-2 rounded-lg transition-all duration-200 hover:bg-white/10 hover:no-underline [&>svg]:hidden",
              hasActiveStep && "bg-white/5"
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
                  <TimelineItem
                    key={String(step.id)}
                    step={stepIndex + 1}
                    className="pb-2"
                  >
                    <TimelineHeader className="items-start">
                      {!isLastInGroup && (
                        <TimelineSeparator
                          className="top-[26px] left-[15px] w-0.5 bg-sm-graphics-primary/30"
                          style={{ height: `${dynamicHeight}px` }}
                        />
                      )}
                      <TimelineIndicator className="border-0 bg-transparent">
                        <div className="mt-2">
                          {isCompleted ? (
                            <div className="flex h-4 w-4 items-center justify-center rounded-full bg-sm-graphics-secondary">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                          ) : isCurrent ? (
                            <div className="h-4 w-4 rounded-full bg-sm-state-success-background animate-pulse" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-sm-graphics-primary" />
                          )}
                        </div>
                      </TimelineIndicator>
                      <div className="flex-1">
                        <button
                          type="button"
                          className={cn(
                            "w-full text-left px-4 py-3 rounded-lg transition-all duration-200 relative z-20",
                            isCurrent && "bg-white/10 backdrop-blur-sm",
                            !isAccessible && "cursor-not-allowed opacity-60",
                            isAccessible && "hover:bg-white/15",
                            isCompleted &&
                              !isCurrent &&
                              "cursor-pointer hover:bg-white/10"
                          )}
                          onClick={() => {
                            if (isAccessible) {
                              navigateToStep(step.id);
                            }
                          }}
                          disabled={!isAccessible}
                        >
                          <TimelineTitle
                            className={cn(
                              "transition-all duration-300",
                              isCurrent
                                ? "font-bold text-primary-foreground"
                                : "font-medium text-primary-foreground/90"
                            )}
                          >
                            {step.label}
                          </TimelineTitle>
                          <TimelineContent
                            className={cn(
                              "mt-1 transition-colors duration-300 leading-relaxed",
                              isCurrent
                                ? "text-primary-foreground/90"
                                : "text-primary-foreground/70"
                            )}
                          >
                            {step.description}
                          </TimelineContent>
                        </button>
                      </div>
                    </TimelineHeader>
                  </TimelineItem>
                );
              })}
            </Timeline>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
