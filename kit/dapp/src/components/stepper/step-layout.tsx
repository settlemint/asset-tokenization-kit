import { cn } from "@/lib/utils";
import { useMemo } from "react";

import { StepComponent } from "@/components/stepper/step";
import { StepGroupComponent } from "@/components/stepper/step-group";
import type { Step, StepOrGroup } from "./types";
import { flattenSteps, getNextStep, isStepGroup } from "./utils";

export interface StepLayoutProps<StepName, GroupName> {
  steps: StepOrGroup<StepName, GroupName>[];
  currentStep: Step<StepName>;
  onStepChange: (step: Step<StepName>) => void;

  children: (props: {
    currentStep: Step<StepName>;
    nextStep: Step<StepName>;
  }) => React.ReactNode;
  navigation?: "forward-only" | "bidirectional";
  className?: string;
}

export function StepLayout<StepName, GroupName>({
  steps,
  currentStep,
  onStepChange,
  children,
  className,
  navigation = "forward-only",
}: StepLayoutProps<StepName, GroupName>) {
  const allSteps = useMemo(() => flattenSteps(steps), [steps]);

  return (
    <div className={cn("step-layout space-y-4", className)}>
      <div className="space-y-2">
        {steps.map((step) => {
          if (isStepGroup(step)) {
            return (
              <StepGroupComponent
                key={step.id}
                group={step}
                currentStep={currentStep}
                allSteps={allSteps}
                onStepChange={onStepChange}
                navigation={navigation}
              />
            );
          }

          return (
            <StepComponent
              key={step.id}
              step={step}
              allSteps={allSteps}
              onStepChange={onStepChange}
              navigation={navigation}
              currentStep={currentStep}
            />
          );
        })}
      </div>

      {children({
        currentStep,
        nextStep: getNextStep(allSteps, currentStep),
      })}
    </div>
  );
}
