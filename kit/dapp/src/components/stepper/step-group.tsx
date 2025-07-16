import { StepComponent } from "@/components/stepper/step";
import type { Step, StepGroup } from "@/components/stepper/types";
import { CollapsibleChevron } from "@/components/ui/collapsible-chevron";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { isGroupCompleted } from "./utils";

export interface StepGroupProps<StepName, GroupName> {
  group: StepGroup<StepName, GroupName>;
  currentStep: Step<StepName>;
  allSteps: Step<StepName>[];
  navigation: "forward-only" | "bidirectional";
  onStepChange: (step: Step<StepName>) => void;
}

export function StepGroupComponent<StepName, GroupName>({
  group,
  currentStep,
  allSteps,
  navigation,
  onStepChange,
}: StepGroupProps<StepName, GroupName>) {
  const [open, setOpen] = useState(false);
  const hasActiveStep = group.steps.some((step) => step.id === currentStep.id);
  const isCompleted = isGroupCompleted(group, currentStep);

  useEffect(() => {
    if (hasActiveStep) {
      setOpen(true);
    }
  }, [hasActiveStep]);

  useEffect(() => {
    if (isCompleted) {
      setOpen(false);
    }
  }, [isCompleted]);

  return (
    <CollapsibleChevron
      open={open}
      onOpenChange={setOpen}
      className={cn(
        hasActiveStep && "bg-primary/5 border border-primary/20 rounded-lg"
      )}
      trigger={() => (
        <div className="flex items-center space-x-3">
          <span
            className={cn(
              "font-semibold text-sm",
              hasActiveStep ? "text-primary" : "text-foreground"
            )}
          >
            {group.label}
          </span>
          {isCompleted && (
            <div className="flex items-center justify-center w-5 h-5 bg-primary rounded-full">
              <Check className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>
      )}
    >
      {(open) => {
        return (
          <>
            {open && (
              <div className="pl-6 space-y-1">
                {group.steps.map((step, index) => {
                  const isLastInGroup = index === group.steps.length - 1;

                  return (
                    <div key={step.id} className="relative">
                      <StepComponent<StepName>
                        step={step}
                        currentStep={currentStep}
                        allSteps={allSteps}
                        navigation={navigation}
                        onStepChange={onStepChange}
                      />

                      {!isLastInGroup && (
                        <div className="absolute left-6 top-16 w-px h-4 bg-border" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {!open && <></>}
          </>
        );
      }}
    </CollapsibleChevron>
  );
}
