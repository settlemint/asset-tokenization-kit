import { StepperIndicator, StepperTrigger } from "@/components/stepper/stepper";
import type { Step } from "@/components/stepper/types";
import { cn } from "@/lib/utils";
import { isStepCompleted } from "./utils";

export interface StepItemProps<StepName> {
  step: Step<StepName>;
  currentStep: Step<StepName>;
  allSteps: Step<StepName>[];
  navigation: "forward-only" | "bidirectional";
  onStepChange: (step: Step<StepName>) => void;
}

export function StepComponent<StepName>({
  step,
  currentStep,
  navigation,
  onStepChange,
}: StepItemProps<StepName>) {
  const isActive = step.id === currentStep.id;
  const isCompleted = isStepCompleted<StepName>(step, currentStep);
  const canSelect = isActive || (isCompleted && navigation === "bidirectional");
  const status = isCompleted ? "completed" : isActive ? "active" : "pending";

  return (
    <div className="flex items-center space-x-3 py-2">
      <StepperTrigger
        disabled={!canSelect}
        onClick={() => {
          onStepChange(step);
        }}
        className={cn(
          "flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 text-left w-full",
          isActive && "bg-primary/10 border border-primary/20",
          !canSelect && "opacity-60 cursor-not-allowed",
          canSelect && !isActive && "hover:bg-muted/50"
        )}
      >
        <StepperIndicator
          status={status}
          className={cn(
            "w-6 h-6 shrink-0",
            status === "completed" && "bg-primary",
            status === "active" && "border-2 border-primary",
            status === "pending" && "border-2 border-muted-foreground/30"
          )}
        />

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              "font-medium text-sm transition-colors",
              isActive ? "text-primary" : "text-foreground"
            )}
          >
            {step.label}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {step.description}
          </div>
        </div>
      </StepperTrigger>
    </div>
  );
}
