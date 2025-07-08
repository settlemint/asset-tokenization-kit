import { cn } from "@/lib/utils";
import { useCallback, useState, useEffect } from "react";
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

  // State for tracking which groups are expanded (accordion behavior)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Initialize expanded groups based on defaultExpanded and current active step
  useEffect(() => {
    if (!groups) return;

    // Find which group contains the current step
    const currentStep = steps[currentStepIndex];
    const currentGroupId = currentStep?.groupId;

    // Set initial expanded groups
    const initialExpanded = new Set<string>();
    
    groups.forEach(group => {
      // Expand group if it contains the current step, or if it's marked as defaultExpanded
      if (group.id === currentGroupId || group.defaultExpanded) {
        initialExpanded.add(group.id);
      }
    });

    setExpandedGroups(initialExpanded);
  }, [groups, steps, currentStepIndex]);

  // Update expanded groups when current step changes (accordion behavior)
  useEffect(() => {
    if (!groups) return;

    const currentStep = steps[currentStepIndex];
    const currentGroupId = currentStep?.groupId;

    if (currentGroupId) {
      // For accordion behavior: only expand the group with the current step
      setExpandedGroups(new Set([currentGroupId]));
    }
  }, [currentStepIndex, steps, groups]);

  // Helper function to check if all steps in a group are completed
  const isGroupCompleted = useCallback((groupId: string) => {
    const groupSteps = steps.filter(step => step.groupId === groupId);
    return groupSteps.every(step => 
      completedSteps.includes(step.id) || 
      steps.findIndex(s => s.id === step.id) < currentStepIndex
    );
  }, [steps, completedSteps, currentStepIndex]);

  // Toggle group expansion
  const toggleGroupExpansion = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set<string>();
      
      // Accordion behavior: if clicking on a different group, expand only that one
      if (!prev.has(groupId)) {
        newSet.add(groupId);
      }
      // If clicking on the same group and it's expanded, keep it expanded (don't collapse current)
      else {
        newSet.add(groupId);
      }
      
      return newSet;
    });
  }, []);

  // Create group toggle handler to avoid creating functions in render
  const createGroupToggleHandler = useCallback((groupId: string) => {
    return () => {
      toggleGroupExpansion(groupId);
    };
  }, [toggleGroupExpansion]);

  const getStepStatus = (step: StepDefinition, index: number): StepStatus => {
    if (stepErrors[step.id]) return "error";
    // A step is completed if it's explicitly marked as completed OR if we're past it
    if (completedSteps.includes(step.id) || index < currentStepIndex) {
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
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="text-current"
                >
                  <circle cx="8" cy="8" r="7" fill="white" />
                  <path
                    d="M10.5 6.5L7 9.5L5.5 8"
                    stroke="rgba(54, 139, 207, 1)"
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
        const groupId = step.groupId ?? "ungrouped";
        acc[groupId] ??= [];
        acc[groupId].push({ step, index });
        return acc;
      },
      {} as Record<string, { step: StepDefinition; index: number }[]>
    );

    return (
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4 pr-2">
            {groups.map((group) => {
              const groupSteps = groupedStepsByGroupId[group.id] ?? [];
              if (groupSteps.length === 0) return null;

              // Check if any step in this group is active
              const hasActiveStep = groupSteps.some(
                ({ index }) => index === currentStepIndex
              );

              const groupCompleted = isGroupCompleted(group.id);
              const isExpanded = expandedGroups.has(group.id);

              return (
                <div key={group.id} className="relative">
                  {/* Clickable Group Header */}
                  <button
                    type="button"
                    onClick={createGroupToggleHandler(group.id)}
                    className={cn(
                      "w-full text-left mb-3 p-2 rounded-lg transition-all duration-200 hover:bg-white/10",
                      hasActiveStep && "bg-white/5"
                    )}
                  >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
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
                    {groupCompleted && (
                      <svg
                        className="w-4 h-4 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <svg
                    className={cn(
                      "w-4 h-4 text-primary-foreground/60 transition-transform duration-200",
                      isExpanded ? "rotate-180" : "rotate-0"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {group.description && (
                  <p className="text-xs text-primary-foreground/50 mt-1">
                    {group.description}
                  </p>
                )}
              </button>

              {/* Collapsible Group Steps */}
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="pl-6">
                  {groupSteps.map(({ step, index }, stepIndex) => {
                    const isLastInGroup = stepIndex === groupSteps.length - 1;
                    return renderStep(step, index, isLastInGroup);
                  })}
                </div>
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
                        stepIndex ===
                        (groupedStepsByGroupId.ungrouped?.length ?? 0) - 1;
                      return renderStep(step, index, isLastStep);
                    }
                  )}
                </div>
              </div>
            )}
          </div>
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
