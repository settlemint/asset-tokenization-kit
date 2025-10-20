import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCallback, useMemo, type ReactNode } from "react";

export interface Step {
  id: string;
  title: string;
  description: string;
  status?: "pending" | "active" | "completed" | "error";
}

interface StepWizardProps {
  steps: Step[];
  currentStepId: string;
  title: string;
  description: string;
  onStepChange: (stepId: string) => void;
  children: ReactNode;
  onClose?: () => void;
  showBackButton?: boolean;
  showNextButton?: boolean;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isNextDisabled?: boolean;
  isBackDisabled?: boolean;
}

/**
 * A multi-step wizard component with sidebar navigation
 */
export function StepWizard({
  steps,
  currentStepId,
  title,
  description,
  onStepChange,
  children,
  onClose,
  showBackButton = true,
  showNextButton = true,
  onBack,
  onNext,
  nextLabel,
  backLabel,
  isNextDisabled = false,
  isBackDisabled = false,
}: StepWizardProps) {
  const sidebarStyle = useMemo(() => {
    return {
      background: "var(--sm-wizard-sidebar-gradient)",
      backgroundSize: "cover",
      backgroundPosition: "top",
      backgroundRepeat: "no-repeat",
      minWidth: "280px",
    };
  }, []);

  const currentStepIndex = steps.findIndex((step) => step.id === currentStepId);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  const handleStepClick = useCallback(
    (stepId: string, isAccessible: boolean) => {
      if (isAccessible) {
        onStepChange(stepId);
      }
    },
    [onStepChange]
  );

  const createStepClickHandler = useCallback(
    (stepId: string, isAccessible: boolean) => () => {
      handleStepClick(stepId, isAccessible);
    },
    [handleStepClick]
  );

  return (
    <div className="flex h-full min-h-[600px]">
      <div className="flex h-full w-full rounded-xl shadow-lg overflow-hidden">
        {/* Sidebar / Steps */}
        <div
          className="w-[320px] flex-shrink-0 p-8 flex flex-col transition-all duration-300"
          style={sidebarStyle}
        >
          {/* Title and Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-primary-foreground mb-2">
              {title}
            </h2>
            <p className="text-sm text-primary-foreground/90 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-primary-foreground/80 mb-2">
              <span>Step {currentStepIndex + 1}</span>
              <span>
                {currentStepIndex + 1} / {steps.length}
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 bg-primary-foreground/20"
            />
          </div>

          {/* Steps */}
          <div className="space-y-0 flex-1 relative">
            {steps.map((step, index) => {
              const isCurrent = currentStepId === step.id;
              const isCompleted =
                index < currentStepIndex || step.status === "completed";
              const isError = step.status === "error";

              // Calculate which steps should be accessible
              const latestCompletedStepIndex = steps.reduce(
                (maxIndex, s, i) => {
                  return s.status === "completed"
                    ? Math.max(maxIndex, i)
                    : maxIndex;
                },
                -1
              );

              const isAccessible =
                step.status === "completed" ||
                step.status === "active" ||
                index <= latestCompletedStepIndex + 1;

              const finalDisabled = !isAccessible;

              return (
                <div key={step.id} className="flex items-stretch mb-0">
                  {/* Dot column with line */}
                  <div className="relative flex flex-col items-center w-12 pt-0">
                    {/* The step dot */}
                    <div
                      className={cn(
                        "flex shrink-0 items-center justify-center rounded-full text-xs font-medium z-30 h-6 w-6 opacity-70 text-primary-foreground transition-all duration-300 ease-in-out",
                        isCurrent && "opacity-100",
                        isError && "opacity-100"
                      )}
                    >
                      {/* Conditional Icon Rendering with Transitions */}
                      <div className="transition-all duration-300 ease-in-out flex items-center justify-center">
                        {isError ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="text-destructive"
                          >
                            <circle cx="8" cy="8" r="7" fill="currentColor" />
                            <path
                              d="M6 6L10 10M10 6L6 10"
                              stroke="var(--destructive-foreground)"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        ) : isCompleted ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 16 16"
                            fill="none"
                            className="text-primary"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="7"
                              fill="var(--background)"
                            />
                            <path
                              d="M10.5 6.5L7 9.5L5.5 8"
                              stroke="currentColor"
                              strokeWidth="1.50"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : isCurrent ? (
                          <svg
                            width="27"
                            height="27"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-current"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="6"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="8" cy="8" r="3" fill="currentColor" />
                          </svg>
                        ) : (
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-current"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="6"
                              stroke="currentColor"
                              strokeWidth="1.75"
                            />
                          </svg>
                        )}
                      </div>
                    </div>

                    {/* Connecting line (for all but last step) */}
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "w-0 border-l-2 border-dashed flex-grow transition-colors duration-300",
                          isCompleted
                            ? "border-primary-foreground/60"
                            : "border-primary-foreground/30"
                        )}
                      />
                    )}
                  </div>

                  {/* Content column */}
                  <div className="flex-1 flex items-center -mt-1 mb-4">
                    <button
                      type="button"
                      className={cn(
                        "flex flex-col w-full px-4 py-3 rounded-lg transition-all duration-200 text-left relative z-20 group",
                        isCurrent &&
                          "bg-primary-foreground/10 backdrop-blur-sm",
                        finalDisabled && "cursor-not-allowed opacity-60",
                        !finalDisabled && "hover:bg-primary-foreground/15",
                        isCompleted &&
                          !isCurrent &&
                          "cursor-pointer hover:bg-primary-foreground/10"
                      )}
                      onClick={createStepClickHandler(step.id, !finalDisabled)}
                      disabled={finalDisabled}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            "text-sm transition-all duration-300",
                            isCurrent
                              ? "font-bold text-primary-foreground"
                              : "font-medium text-primary-foreground/90",
                            isError && "text-destructive-foreground"
                          )}
                        >
                          {step.title}
                        </span>
                        {isError && (
                          <span className="text-xs text-destructive-foreground font-medium">
                            Error
                          </span>
                        )}
                      </div>
                      <p
                        className={cn(
                          "text-xs mt-1 transition-colors duration-300 leading-relaxed",
                          isCurrent
                            ? "text-primary-foreground/90"
                            : "text-primary-foreground/70",
                          isError && "text-destructive-foreground/80"
                        )}
                      >
                        {step.description}
                      </p>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Close button */}
          {onClose && (
            <Button
              variant="ghost"
              className="mt-auto w-full text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground transition-all duration-200"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}
        </div>

        {/* Content area */}
        <div
          className="flex-1 flex flex-col transition-all duration-300 relative overflow-hidden"
          style={useMemo(
            () => ({ backgroundColor: "var(--sm-background-lightest)" }),
            []
          )}
        >
          <div className="flex-1 overflow-y-auto p-8">
            <div className="w-full h-full">{children}</div>
          </div>

          {/* Navigation buttons */}
          {(showBackButton || showNextButton) && (
            <div className="p-6 relative z-20">
              <div className="flex justify-end gap-3">
                {showBackButton && onBack && (
                  <Button
                    variant="outline"
                    onClick={onBack}
                    disabled={isBackDisabled}
                    className="transition-all duration-200"
                  >
                    {backLabel ?? "Back"}
                  </Button>
                )}
                {showNextButton && onNext && (
                  <Button
                    onClick={onNext}
                    disabled={isNextDisabled}
                    className="transition-all duration-200"
                  >
                    {nextLabel ?? "Next"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
