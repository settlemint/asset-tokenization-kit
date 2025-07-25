import { StepComponent } from "@/components/stepper/step";
import type {
  NavigationMode,
  Step,
  StepGroup,
} from "@/components/stepper/types";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { isGroupCompleted } from "./utils";

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
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActiveStep = group.steps.some((step) => step.id === currentStep.id);
  const groupCompleted = isGroupCompleted(group, currentStep);

  useEffect(() => {
    if (hasActiveStep) {
      setIsExpanded(true);
    }
  }, [hasActiveStep]);

  useEffect(() => {
    if (groupCompleted) {
      setIsExpanded(false);
    }
  }, [groupCompleted]);

  return (
    <div className="StepGroup">
      <button
        type="button"
        onClick={() => {
          setIsExpanded(!isExpanded);
        }}
        className={cn(
          "w-full text-left mb-3 p-2 rounded-lg transition-all duration-200 hover:bg-white/10",
          hasActiveStep && "bg-white/5"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
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
              <Check className="w-4 h-4 text-primary-foreground/60" />
            )}
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-primary-foreground/60 transition-transform duration-200",
              isExpanded ? "rotate-180" : "rotate-0"
            )}
          />
        </div>
        {group.description && (
          <p className="text-xs text-primary-foreground/50 mt-1">
            {group.description}
          </p>
        )}
      </button>

      {/* Collapsible Group Steps */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="pl-6">
          {group.steps.map((step) => {
            return (
              <StepComponent<StepId, GroupId>
                step={step}
                currentStep={currentStep}
                allSteps={allSteps}
                navigation={navigation}
                onStepSelect={onStepSelect}
                group={group}
                key={step.step}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
