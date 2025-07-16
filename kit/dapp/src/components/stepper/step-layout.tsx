import { cn } from "@/lib/utils";
import { useCallback, useMemo, useState } from "react";

import { StepComponent } from "@/components/stepper/step";
import { StepGroupComponent } from "@/components/stepper/step-group";
import type { Step, StepOrGroup } from "./types";
import { flattenSteps, isStepGroup } from "./utils";

export interface StepLayoutProps<
  StepName extends string = string,
  GroupName extends string = never,
> {
  steps: StepOrGroup<StepName, GroupName>[];
  defaultStep: Step<StepName>;
  onStepChange: (step: StepOrGroup<StepName, GroupName>) => void;

  children: (props: {
    currentStep: Step<StepName>;
    nextStep: Step<StepName>;
  }) => React.ReactNode;
  navigation?: "forward-only" | "bidirectional";
  className?: string;
}

export function StepLayout<
  StepName extends string = string,
  GroupName extends string = never,
>({
  steps,
  defaultStep,
  onStepChange,
  children,
  className,
  navigation = "forward-only",
}: StepLayoutProps<StepName, GroupName>) {
  const allSteps = useMemo(() => flattenSteps(steps), [steps]);
  const [currentStep, setCurrentStep] = useState<Step<StepName>>(defaultStep);

  const handleStepChange = useCallback(
    (step: Step<StepName>) => {
      setCurrentStep(step);
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
        nextStep: currentStep,
      })}
    </div>
  );
}
