import type { Step } from "@/components/stepper/types";
import {
  TimelineContent,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface TimelineStepItemProps<StepId> {
  step: Step<StepId>;
  stepIndex: number;
  isCurrent: boolean;
  isCompleted: boolean;
  isAccessible: boolean;
  isLast: boolean;
  dynamicHeight: number;
  onStepSelect: (step: Step<StepId>) => void;
}

export function StepItem<StepId>({
  step,
  stepIndex,
  isCurrent,
  isCompleted,
  isAccessible,
  isLast,
  dynamicHeight,
  onStepSelect,
}: TimelineStepItemProps<StepId>) {
  return (
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
                <Check className="h-3 w-3 text-primary-foreground" />
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
              isCurrent && "bg-primary-foreground/10 backdrop-blur-sm",
              !isAccessible && "cursor-not-allowed opacity-60",
              isAccessible && "hover:bg-primary-foreground/15",
              isCompleted &&
                !isCurrent &&
                "cursor-pointer hover:bg-primary-foreground/10"
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
  );
}
