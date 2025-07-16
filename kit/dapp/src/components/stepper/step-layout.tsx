import { cn } from "@/lib/utils";
import { useCallback, useMemo } from "react";

import { StepComponent } from "@/components/stepper/step";
import { StepGroupComponent } from "@/components/stepper/step-group";
import type { Step, StepOrGroup } from "./types";
import { flattenSteps, getNextStep, isStepGroup } from "./utils";

export interface StepLayoutProps<StepName, GroupName> {
  steps: StepOrGroup<StepName, GroupName>[];
  currentStep: Step<StepName>;
  onStepChange: (step: StepOrGroup<StepName, GroupName>) => void;

  children: (props: {
    currentStep: Step<StepName>;
    nextStep: Step<StepName>;
  }) => React.ReactNode;
  navigation?: "forward-only" | "bidirectional";
  className?: string;
}

export function StepLayout<
  StepName extends string = never,
  GroupName extends string = never,
>({
  steps,
  currentStep,
  onStepChange,
  children,
  className,
  navigation = "forward-only",
}: StepLayoutProps<StepName, GroupName>) {
  const allSteps = useMemo(() => flattenSteps(steps), [steps]);

  const handleStepChange = useCallback(
    (step: Step<StepName>) => {
      onStepChange(step);
    },
    [onStepChange]
  );

  return (
    <div className={cn("step-layout space-y-4", className)}>
      <div className="space-y-2">
        {steps.map((step) => {
          if (isStepGroup(step)) {
            return (
              <StepGroupComponent<StepName, GroupName>
                key={step.id}
                group={step}
                currentStep={currentStep}
                allSteps={allSteps}
                onStepChange={handleStepChange}
                navigation={navigation}
              />
            );
          }

          return (
            <StepComponent<StepName>
              key={step.id}
              step={step}
              allSteps={allSteps}
              onStepChange={handleStepChange}
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
