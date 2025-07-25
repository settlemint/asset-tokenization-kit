import type {
  NavigationMode,
  Step,
  StepGroup,
} from "@/components/stepper/types";
import { isLastStepInGroup, isStepCompleted } from "@/components/stepper/utils";
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

  // Helper function to calculate dynamic height for timeline separators
  const calculateLineHeight = (description?: string) => {
    if (!description) return 60;
    const baseHeight = 60;
    const extraHeight = Math.min(description.length / 50, 3) * 20;
    return baseHeight + extraHeight;
  };

  const dynamicHeight = calculateLineHeight(step.description);

  return (
    <Timeline className="space-y-3">
      <TimelineItem step={stepIndex + 1} className="pb-2">
        <TimelineHeader className="items-start">
          {!isLast && (
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
                isCompleted && !isCurrent && "cursor-pointer hover:bg-white/10"
              )}
              onClick={() => {
                if (isAccessible) {
                  onStepSelect(step);
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
    </Timeline>
  );
}
