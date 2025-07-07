import { cn } from "@/lib/utils";
import { useCallback } from "react";
import type { StepDefinition, StepStatus } from "./types";
import { useWizardContext } from "./wizard-context";

interface WizardSidebarProps {
  className?: string;
}

export function WizardSidebar({ className }: WizardSidebarProps) {
  const {
    steps,
    groups,
    currentStepIndex,
    completedSteps,
    stepErrors,
    canNavigateToStep,
    navigateToStep,
  } = useWizardContext();

  // Debug log the completed steps
  console.log('WizardSidebar render - completedSteps:', completedSteps, 'currentStepIndex:', currentStepIndex);

  const getStepStatus = (step: StepDefinition, index: number): StepStatus => {
    if (stepErrors[step.id]) return "error";
    if (completedSteps.includes(step.id)) {
      console.log(`Step ${step.id} is marked as completed`);
      return "completed";
    }
    if (index === currentStepIndex) return "active";
    return "pending";
  };

  // Create step click handler
  const createStepClickHandler = useCallback(
    (stepIndex: number, isAccessible: boolean) => () => {
      if (isAccessible) {
        navigateToStep(stepIndex);
      }
    },
    [navigateToStep]
  );

  const renderStep = (
    step: StepDefinition,
    index: number,
    isLastInGroup = false
  ) => {
    const status = getStepStatus(step, index);
    const isCurrent = index === currentStepIndex;
    const isCompleted = status === "completed";
    const isError = status === "error";
    const isAccessible = canNavigateToStep(index);
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
                  className="text-current"
                >
                  <circle cx="8" cy="8" r="7" fill="#ef4444" />
                  <path
                    d="M6 6L10 10M10 6L6 10"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              ) : isCompleted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-current"
                >
                  <circle cx="12" cy="12" r="10" fill="#10b981" />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="white"
                    strokeWidth="2"
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
          {!isLastInGroup && (
            <div
              className={cn(
                "w-0 border-l-2 border-dashed flex-grow transition-colors duration-300",
                isCompleted ? "border-white/60" : "border-white/30"
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
              isCurrent && "bg-white/10 backdrop-blur-sm",
              finalDisabled && "cursor-not-allowed opacity-60",
              !finalDisabled && "hover:bg-white/15",
              isCompleted && !isCurrent && "cursor-pointer hover:bg-white/10"
            )}
            onClick={createStepClickHandler(index, !finalDisabled)}
            disabled={finalDisabled}
          >
            <div className="flex items-center justify-between">
              <span
                className={cn(
                  "text-sm transition-all duration-300",
                  isCurrent
                    ? "font-bold text-primary-foreground"
                    : "font-medium text-primary-foreground/90",
                  isError && "text-red-200"
                )}
              >
                {step.title}
              </span>
              {isError && (
                <span className="text-xs text-red-200 font-medium">Error</span>
              )}
            </div>
            <p
              className={cn(
                "text-xs mt-1 transition-colors duration-300 leading-relaxed",
                isCurrent
                  ? "text-primary-foreground/90"
                  : "text-primary-foreground/70",
                isError && "text-red-200/80"
              )}
            >
              {step.description}
            </p>
            {stepErrors[step.id] && (
              <p className="text-xs text-red-200/80 mt-1">
                {stepErrors[step.id]}
              </p>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderGroupedSteps = () => {
    if (!groups) return null;

    // Group steps by their groupId
    const groupedStepsByGroupId = steps.reduce(
      (acc, step, index) => {
        const groupId = step.groupId || "ungrouped";
        if (!acc[groupId]) acc[groupId] = [];
        acc[groupId].push({ step, index });
        return acc;
      },
      {} as Record<string, { step: StepDefinition; index: number }[]>
    );

    return (
      <div className="space-y-6 flex-1 relative">
        {groups.map((group, groupIndex) => {
          const groupSteps = groupedStepsByGroupId[group.id] || [];
          if (groupSteps.length === 0) return null;

          // Check if any step in this group is active
          const hasActiveStep = groupSteps.some(
            ({ index }) => index === currentStepIndex
          );

          return (
            <div key={group.id} className="relative">
              {/* Group Title */}
              <div className="mb-3">
                <h3
                  className={cn(
                    "text-base font-bold transition-all duration-300",
                    hasActiveStep
                      ? "text-primary-foreground"
                      : "text-primary-foreground/70"
                  )}
                >
                  {group.title}
                </h3>
                {group.description && (
                  <p className="text-xs text-primary-foreground/50 mt-1">
                    {group.description}
                  </p>
                )}
              </div>

              {/* Group Steps */}
              <div className="pl-6">
                {groupSteps.map(({ step, index }, stepIndex) => {
                  const isLastInGroup = stepIndex === groupSteps.length - 1;
                  const isLastOverall =
                    groupIndex === groups.length - 1 && isLastInGroup;
                  return renderStep(step, index, isLastOverall);
                })}
              </div>
            </div>
          );
        })}

        {/* Render ungrouped steps if any */}
        {groupedStepsByGroupId.ungrouped && (
          <div className="relative">
            <div className="pl-2">
              {groupedStepsByGroupId.ungrouped.map(
                ({ step, index }, stepIndex) => {
                  const isLastStep =
                    stepIndex === groupedStepsByGroupId.ungrouped!.length - 1;
                  return renderStep(step, index, isLastStep);
                }
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn("flex-1", className)}>
      {groups ? (
        renderGroupedSteps()
      ) : (
        <div className="space-y-0 flex-1 relative">
          {steps.map((step, index) => {
            const isLastStep = index === steps.length - 1;
            return renderStep(step, index, isLastStep);
          })}
        </div>
      )}
    </div>
  );
}
