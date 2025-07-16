import { cn } from "@/lib/utils";
import { useMemo } from "react";

import { StepComponent } from "@/components/stepper/step";
import { StepGroupComponent } from "@/components/stepper/step-group";
import type { Step, StepOrGroup } from "./types";
import { flattenSteps, getNextStep, isStepGroup } from "./utils";

export interface StepLayoutProps<StepName, GroupName> {
  stepsOrGroups: StepOrGroup<StepName, GroupName>[];
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
  stepsOrGroups,
  currentStep,
  onStepChange,
  children,
  className,
  navigation = "forward-only",
}: StepLayoutProps<StepName, GroupName>) {
  const allSteps = useMemo(() => flattenSteps(stepsOrGroups), [stepsOrGroups]);

  return (
    <div className={cn("step-layout space-y-4", className)}>
      <div className="space-y-2">
        {stepsOrGroups.map((item) => {
          if (isStepGroup(item)) {
            return (
              <StepGroupComponent
                key={item.label}
                group={item}
                currentStep={currentStep}
                allSteps={allSteps}
                onStepChange={onStepChange}
                navigation={navigation}
              />
            );
          }

          return (
            <StepComponent
              key={item.id}
              step={item}
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
