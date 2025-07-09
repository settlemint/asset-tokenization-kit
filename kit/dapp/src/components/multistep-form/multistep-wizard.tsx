import { ComponentErrorBoundary } from "@/components/error/component-error-boundary";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useForm } from "@tanstack/react-form";
import { useCallback, useMemo } from "react";
import type { MultiStepWizardProps, WizardContextValue } from "./types";
import { useMultiStepWizardState } from "./use-multistep-wizard-state";
import { WizardProvider } from "./wizard-context";
import { WizardSidebar } from "./wizard-sidebar";
import { WizardStep } from "./wizard-step";

const logger = createLogger();

export function MultiStepWizard<TFormData = Record<string, unknown>>({
  name,
  description,
  steps,
  groups,
  onComplete,
  enableUrlPersistence = true,
  debounceMs = 300,
  className,
  sidebarClassName,
  contentClassName,
  defaultValues = {},
  showProgressBar = true,
  allowStepSkipping = false,
}: MultiStepWizardProps<TFormData>) {
  logger.debug("MultiStepWizard initialization", {
    name,
    stepsCount: steps.length,
    hasGroups: !!groups,
    enableUrlPersistence,
    hasDefaultValues: !!defaultValues,
  });

  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns

  const {
    currentStepIndex,
    completedSteps,
    stepErrors,
    setCurrentStepIndex,
    setCompletedSteps,
    setStepErrors,
    reset,
  } = useMultiStepWizardState({
    name,
    enableUrlPersistence,
    debounceMs,
    defaultState: {
      currentStepIndex: 0,
      completedSteps: [],
      stepErrors: {},
    },
  });

  // Create form with TanStack Form
  const form = useForm({
    defaultValues: defaultValues as TFormData,
    onSubmit: async ({ value }: { value: TFormData }) => {
      await onComplete(value);
      reset();
    },
  });

  logger.debug("Form created", {
    hasForm: !!form,
    formState: "available",
    defaultValues: defaultValues,
  });

  // Note: Form data persistence is now handled by ORPC API, not URL state

  // Ensure currentStepIndex is valid
  const safeCurrentStepIndex = useMemo(() => {
    if (currentStepIndex < 0 || currentStepIndex >= steps.length) {
      logger.warn("Invalid step index detected, resetting to 0", {
        currentStepIndex,
        stepsLength: steps.length,
      });
      return 0; // Default to first step if index is invalid
    }
    return currentStepIndex;
  }, [currentStepIndex, steps]);

  // Calculate progress based on current step (shows progress for the step you're on)
  const progress = useMemo(() => {
    if (steps.length === 0) return 0;
    // Progress should include the current step being worked on
    const currentProgress =
      ((Number(safeCurrentStepIndex) + 1) / Number(steps.length)) * 100;
    const finalProgress = Math.round(currentProgress);

    // Temporary debug logging
    logger.debug("Progress calculation", {
      safeCurrentStepIndex,
      stepsLength: steps.length,
      currentProgress,
      finalProgress,
      completedStepsLength: completedSteps.length,
    });

    return finalProgress;
  }, [safeCurrentStepIndex, steps.length, completedSteps.length]);

  // Navigation functions
  const canNavigateToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= steps.length) return false;
      if (stepIndex === safeCurrentStepIndex) return true;
      if (allowStepSkipping) return true;

      // Allow navigation to:
      // 1. Any previous step (stepIndex < safeCurrentStepIndex)
      // 2. Completed steps
      // 3. The next step after current
      const targetStep = steps[stepIndex];
      if (!targetStep) return false;

      return (
        stepIndex < safeCurrentStepIndex || // Allow going back to any previous step
        completedSteps.includes(targetStep.id) ||
        stepIndex === Number(safeCurrentStepIndex) + 1
      );
    },
    [steps, safeCurrentStepIndex, completedSteps, allowStepSkipping]
  );

  const navigateToStep = useCallback(
    (stepIndex: number) => {
      if (canNavigateToStep(stepIndex)) {
        setCurrentStepIndex(stepIndex);
      }
    },
    [canNavigateToStep, setCurrentStepIndex]
  );

  const nextStep = useCallback(() => {
    if (safeCurrentStepIndex < steps.length - 1) {
      setCurrentStepIndex(Number(safeCurrentStepIndex) + 1);
    }
  }, [safeCurrentStepIndex, steps.length, setCurrentStepIndex]);

  const previousStep = useCallback(() => {
    if (safeCurrentStepIndex > 0) {
      setCurrentStepIndex(safeCurrentStepIndex - 1);
    }
  }, [safeCurrentStepIndex, setCurrentStepIndex]);

  const markStepComplete = useCallback(
    (stepId: string) => {
      if (!completedSteps.includes(stepId)) {
        const newCompletedSteps = [...completedSteps, stepId];
        setCompletedSteps(newCompletedSteps);
      }
    },
    [completedSteps, setCompletedSteps]
  );

  const markStepError = useCallback(
    (stepId: string, error: string) => {
      setStepErrors({ ...stepErrors, [stepId]: error });
    },
    [stepErrors, setStepErrors]
  );

  const clearStepError = useCallback(
    (stepId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [stepId]: _unused, ...rest } = stepErrors;
      setStepErrors(rest);
    },
    [stepErrors, setStepErrors]
  );

  const resetWizard = useCallback(() => {
    reset();
    form.reset();
  }, [reset, form]);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Create context value
  const contextValue: WizardContextValue<TFormData> = {
    currentStepIndex: safeCurrentStepIndex,
    setCurrentStepIndex,
    completedSteps,
    markStepComplete,
    markStepError,
    clearStepError,
    stepErrors,
    form,
    steps,
    groups,
    canNavigateToStep,
    navigateToStep,
    nextStep,
    previousStep,
    isFirstStep: safeCurrentStepIndex === 0,
    isLastStep: safeCurrentStepIndex === steps.length - 1,
    resetWizard,
  };

  logger.debug("Context value created", {
    currentStepIndex: safeCurrentStepIndex,
    stepsLength: steps.length,
    hasForm: !!form,
    hasSteps: !!steps,
  });

  // Calculate wizard-specific styles matching StepWizard
  const sidebarStyle = useMemo(() => {
    return {
      background: "var(--sm-wizard-sidebar-gradient)",
      backgroundSize: "cover",
      backgroundPosition: "top",
      backgroundRepeat: "no-repeat",
      minWidth: "320px",
    };
  }, []);

  const contentStyle = useMemo(() => {
    return { backgroundColor: "var(--sm-background-lightest)" };
  }, []);

  // Calculate dynamic height based on content
  const dynamicHeight = useMemo(() => {
    const baseHeight = 300; // Base height for title, progress, etc. (increased)
    const stepHeight = 100; // Approximate height per step (increased)
    const groupHeaderHeight = 80; // Height for group headers (increased)
    const spacingPadding = 100; // Additional padding for margins, spacing, etc.
    const minHeight = 600; // Minimum height
    const maxHeight = 1000; // Maximum height to prevent excessive size (increased)

    if (!groups || groups.length === 0) {
      // No groups, calculate based on total steps
      return Math.min(
        Math.max(
          baseHeight + steps.length * stepHeight + spacingPadding,
          minHeight
        ),
        maxHeight
      );
    }

    // Calculate height needed for the largest group when expanded
    const maxGroupSize =
      groups.length > 0
        ? Math.max(
            ...groups.map((group) => {
              const groupSteps = steps.filter(
                (step) => step.groupId === group.id
              );
              return groupSteps.length;
            })
          )
        : 0;

    // Calculate total height needed
    const totalGroupHeaders = groups.length * groupHeaderHeight;
    const maxGroupContent = maxGroupSize * stepHeight;
    const calculatedHeight =
      baseHeight + totalGroupHeaders + maxGroupContent + spacingPadding;
    const finalHeight = Math.min(
      Math.max(calculatedHeight, minHeight),
      maxHeight
    );

    logger.debug("Dynamic height calculation", {
      baseHeight,
      totalGroupHeaders,
      maxGroupContent,
      spacingPadding,
      calculatedHeight,
      finalHeight,
      groupsCount: groups.length,
      maxGroupSize,
      totalSteps: steps.length,
    });

    return finalHeight;
  }, [steps, groups]);

  // NOW handle conditional rendering after all hooks have been called
  if (steps.length === 0) {
    logger.error("MultiStepWizard requires at least one step");
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-center text-muted-foreground">
          No wizard steps configured. Please provide at least one step.
        </p>
      </div>
    );
  }

  return (
    <ComponentErrorBoundary componentName={name || "Multi-Step Wizard"}>
      <WizardProvider value={contextValue}>
        <div
          className={cn("flex", className)}
          style={{ height: `${dynamicHeight}px` }}
        >
          <div className="flex h-full w-full rounded-xl shadow-lg overflow-hidden">
            {/* Sidebar */}
            <div
              className={cn(
                "w-[320px] flex-shrink-0 p-8 flex flex-col transition-all duration-300",
                sidebarClassName
              )}
              style={sidebarStyle}
            >
              {/* Title and Progress */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                  {name
                    ? name
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")
                    : "Setup Wizard"}
                </h2>
                <p className="text-sm text-primary-foreground/90 leading-relaxed mb-4">
                  {description ?? "Configure your platform step by step"}
                </p>

                {showProgressBar && (
                  <div>
                    <div className="flex justify-between text-xs text-primary-foreground/80 mb-2">
                      <span>Step {Number(safeCurrentStepIndex) + 1}</span>
                      <span>
                        {Number(safeCurrentStepIndex) + 1} /{" "}
                        {Number(steps.length)}
                      </span>
                    </div>
                    <Progress
                      value={progress}
                      className="h-2 bg-primary-foreground/20"
                    />
                  </div>
                )}
              </div>

              <WizardSidebar />
            </div>

            {/* Main content */}
            <div
              className={cn(
                "flex-1 flex flex-col transition-all duration-300 relative overflow-hidden",
                contentClassName
              )}
              style={contentStyle}
            >
              <div className="flex-1 overflow-y-auto p-8">
                <div className="w-full h-full">
                  <form onSubmit={handleFormSubmit}>
                    <WizardStep />
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </WizardProvider>
    </ComponentErrorBoundary>
  );
}
