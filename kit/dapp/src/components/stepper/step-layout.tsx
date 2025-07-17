import { cn } from "@/lib/utils";
import { useMemo } from "react";

import { StepComponent } from "@/components/stepper/step";
import { StepGroupComponent } from "@/components/stepper/step-group";
import type { Navigation } from "@/components/stepper/types";
import type { Step, StepOrGroup } from "./types";
import { flattenSteps, getNextStep, isStepGroup } from "./utils";

export interface StepLayoutProps<StepName, GroupName> {
  stepsOrGroups: StepOrGroup<StepName, GroupName>[];
  currentStep: Step<StepName>;
  onStepSelect: (step: Step<StepName>) => void;

  children: (props: {
    currentStep: Step<StepName>;
    nextStep: Step<StepName>;
  }) => React.ReactNode;
  navigation?: Navigation;
  className?: string;
}

export function StepLayout<StepName, GroupName>({
  stepsOrGroups,
  currentStep,
  onStepSelect,
  children,
  className,
  navigation = "next-only",
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
                onStepSelect={onStepSelect}
                navigation={navigation}
              />
            );
          }

          return (
            <StepComponent
              key={item.id}
              step={item}
              allSteps={allSteps}
              onStepSelect={onStepSelect}
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
