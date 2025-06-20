import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface Step {
  id: string;
  title: string;
  description: string;
  status?: "pending" | "active" | "completed" | "error";
}

export interface StepWizardProps {
  steps: Step[];
  currentStepId: string;
  title: string;
  description: string;
  onStepChange: (stepId: string) => void;
  children: ReactNode;
  // onClose?: () => void;
  showBackButton?: boolean;
  showNextButton?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
}

export function StepWizard({
  steps,
  currentStepId,
  title,
  description,
  onStepChange,
  children,
  // onClose,
  showBackButton = false,
  showNextButton = false,
  onBack,
  onNext,
  nextLabel = "Next",
  backLabel = "Back",
  isNextDisabled = false,
  isBackDisabled = false,
}: StepWizardProps) {
  // const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);
  const completedSteps = steps.filter(
    (step) => step.status === "completed"
  ).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const isStepAccessible = (stepIndex: number) => {
    // Can access completed steps and the next step after the last completed
    const lastCompletedIndex = steps.findIndex(
      (step, idx) =>
        step.status !== "completed" &&
        idx > 0 &&
        steps[idx - 1]?.status === "completed"
    );

    if (lastCompletedIndex === -1) {
      // All steps are completed or none are
      return stepIndex === 0 || steps[stepIndex]?.status === "completed";
    }

    return stepIndex <= lastCompletedIndex;
  };

  return (
    <div className="flex min-h-[600px] overflow-hidden rounded-lg bg-background shadow-lg">
      {/* Left Sidebar */}
      <div className="relative w-[320px] bg-gradient-to-br from-sm-background-gradient-start to-sm-background-gradient-end p-8">
        {/* Brand gradient overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background:
              "linear-gradient(135deg, var(--sm-graphics-primary), var(--sm-graphics-secondary), var(--sm-graphics-tertiary))",
          }}
        />

        <div className="relative z-10">
          <h2 className="mb-2 text-2xl font-bold text-sm-text">{title}</h2>
          <p className="mb-8 text-sm text-sm-text opacity-80">{description}</p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-sm-text opacity-70">Progress</span>
              <span className="text-sm-text opacity-70">
                {completedSteps} of {steps.length} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isActive = step.id === currentStepId;
              const isCompleted = step.status === "completed";
              const isError = step.status === "error";
              const isAccessible = isStepAccessible(index);

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (isAccessible) {
                      onStepChange(step.id);
                    }
                  }}
                  disabled={!isAccessible}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-lg p-3 text-left transition-all duration-300",
                    isActive && "bg-card/90 shadow-md",
                    !isActive && isAccessible && "hover:bg-card/50",
                    !isAccessible && "cursor-not-allowed opacity-50"
                  )}
                >
                  {/* Step indicator */}
                  <div className="relative">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300",
                        isCompleted && "bg-sm-state-success text-white",
                        isError && "bg-sm-state-error text-white",
                        isActive &&
                          !isCompleted &&
                          !isError &&
                          "bg-primary text-primary-foreground",
                        !isActive && !isCompleted && !isError && "bg-muted"
                      )}
                    >
                      {isCompleted ? (
                        <CheckIcon className="h-5 w-5" />
                      ) : isError ? (
                        <XIcon className="h-5 w-5" />
                      ) : (
                        <span className="text-sm font-medium">{index + 1}</span>
                      )}
                    </div>
                    {isActive && (
                      <div className="absolute inset-0 animate-ping rounded-full bg-primary opacity-25" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1">
                    <h3
                      className={cn(
                        "font-medium transition-colors",
                        isActive && "text-sm-text",
                        !isActive && "text-sm-text opacity-80"
                      )}
                    >
                      {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1 overflow-y-auto p-8">{children}</div>

        {/* Navigation buttons */}
        {(showBackButton || showNextButton) && (
          <div className="flex items-center justify-between border-t bg-sm-background-darkest px-8 py-4">
            <div>
              {showBackButton && (
                <Button
                  variant="outline"
                  onClick={onBack}
                  disabled={isBackDisabled}
                >
                  {backLabel}
                </Button>
              )}
            </div>
            <div>
              {showNextButton && (
                <Button onClick={onNext} disabled={isNextDisabled}>
                  {nextLabel}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
