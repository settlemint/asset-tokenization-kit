import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useForm } from "@tanstack/react-form";
import { useCallback, useMemo } from "react";
import { calculateWizardHeight } from "./calculate-wizard-height";
import type { MultiStepWizardProps, WizardContextValue } from "./types";
import { useMultiStepWizardState } from "./use-multistep-wizard-state";
import { WizardProvider } from "./wizard-context";
import { WizardSidebar } from "./wizard-sidebar";
import { WizardStep } from "./wizard-step";

const logger = createLogger();

export function MultiStepWizard<TFormData = Record<string, unknown>>({
  name,
  title,
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
  onStepChange,
  defaultStepIndex = 0,
}: MultiStepWizardProps<TFormData>) {
  logger.debug("MultiStepWizard initialization", {
    name,
    stepsCount: steps.length,
    hasGroups: !!groups,
    enableUrlPersistence,
    hasDefaultValues: !!defaultValues,
  });

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
      currentStepIndex: defaultStepIndex,
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
      // 4. Steps which have a component
      const targetStep = steps[stepIndex];
      if (!targetStep) return false;
      if (!targetStep.component) return false;

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
        if (typeof onStepChange === "function") {
          onStepChange(stepIndex);
        }
      }
    },
    [canNavigateToStep, setCurrentStepIndex, onStepChange]
  );

  const nextStep = useCallback(() => {
    if (safeCurrentStepIndex < steps.length - 1) {
      setCurrentStepIndex(Number(safeCurrentStepIndex) + 1);
      if (typeof onStepChange === "function") {
        onStepChange(Number(safeCurrentStepIndex) + 1);
      }
    }
  }, [safeCurrentStepIndex, steps.length, setCurrentStepIndex, onStepChange]);

  const previousStep = useCallback(() => {
    if (safeCurrentStepIndex > 0) {
      setCurrentStepIndex(safeCurrentStepIndex - 1);
      if (typeof onStepChange === "function") {
        onStepChange(safeCurrentStepIndex - 1);
      }
    }
  }, [safeCurrentStepIndex, setCurrentStepIndex, onStepChange]);

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
      const { [stepId]: _, ...rest } = stepErrors;
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
  const dynamicHeight = useMemo(
    () => calculateWizardHeight(steps, groups),
    [steps, groups]
  );

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
    <WizardProvider value={contextValue}>
      <div
        className={cn("flex", className)}
        style={{ height: `${String(dynamicHeight)}px` }}
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
            {/* Title and Progress  */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-primary-foreground mb-2">
                {title ??
                  (name
                    ? name
                        .split("-")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")
                    : "Setup Wizard")}
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
  );
}
