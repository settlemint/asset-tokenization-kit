import { cn } from "@/lib/utils";
import { useMemo } from "react";

import { StepComponent } from "@/components/stepper/step";
import { StepGroupComponent } from "@/components/stepper/step-group";
import type { NavigationMode } from "@/components/stepper/types";
import type { Step, StepOrGroup } from "./types";
import { flattenSteps, getNextStep, isStepGroup } from "./utils";

export interface StepLayoutProps<StepId, GroupId> {
  stepsOrGroups: StepOrGroup<StepId, GroupId>[];
  currentStep: Step<StepId>;
  onStepSelect: (step: Step<StepId>) => void;

  children: (props: {
    currentStep: Step<StepId>;
    nextStep: Step<StepId>;
  }) => React.ReactNode;
  navigationMode?: NavigationMode;
  className?: string;
}

export function StepLayout<StepId, GroupId>({
  stepsOrGroups,
  currentStep,
  onStepSelect,
  children,
  className,
  navigationMode = "next-only",
}: StepLayoutProps<StepId, GroupId>) {
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
                navigation={navigationMode}
              />
            );
          }

          return (
            <StepComponent
              key={item.step}
              step={item}
              allSteps={allSteps}
              onStepSelect={onStepSelect}
              navigation={navigationMode}
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
