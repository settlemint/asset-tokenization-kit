import { StepComponent } from "@/components/stepper/step";
import type {
  NavigationMode,
  Step,
  StepGroup,
} from "@/components/stepper/types";
import { CollapsibleChevron } from "@/components/ui/collapsible-chevron";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
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
  const [open, setOpen] = useState(false);
  const hasActiveStep = group.steps.some(
    (step) => step.step === currentStep.step
  );
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
          <span className="text-sm text-muted-foreground">
            {group.description}
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
                    <div key={step.step} className="relative">
                      <StepComponent<StepId>
                        step={step}
                        currentStep={currentStep}
                        allSteps={allSteps}
                        navigation={navigation}
                        onStepSelect={onStepSelect}
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
