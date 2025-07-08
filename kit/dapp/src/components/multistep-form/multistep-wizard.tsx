import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { useForm } from "@tanstack/react-form";
import { useCallback } from "react";
import type { MultiStepWizardProps, WizardContextValue } from "./types";
import { useMultiStepWizardState } from "./use-multistep-wizard-state";
import { WizardProvider } from "./wizard-context";
import { WizardHeader } from "./wizard-header";
import { WizardSidebar } from "./wizard-sidebar";
import { WizardStep } from "./wizard-step";

const logger = createLogger({
  level: env.SETTLEMINT_LOG_LEVEL,
});

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

  // Derive valid currentStepIndex
  const safeCurrentStepIndex =
    currentStepIndex < 0 || currentStepIndex >= steps.length
      ? 0
      : currentStepIndex;

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

  // Derive wizard-specific styles
  const sidebarStyle = {
    background: "var(--sm-wizard-sidebar-gradient)",
    backgroundSize: "cover",
    backgroundPosition: "top",
    backgroundRepeat: "no-repeat",
    minWidth: "320px",
  };

  const contentStyle = {
    backgroundColor: "var(--sm-background-lightest)",
  };

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
      <div className={cn("flex h-full min-h-[600px]", className)}>
        <div className="flex h-full w-full rounded-xl shadow-lg overflow-hidden">
          {/* Sidebar */}
          <div
            className={cn(
              "w-[320px] flex-shrink-0 p-8 flex flex-col transition-all duration-300",
              sidebarClassName
            )}
            style={sidebarStyle}
          >
            <WizardHeader
              name={name}
              description={description}
              currentStepIndex={safeCurrentStepIndex}
              totalSteps={steps.length}
              showProgressBar={showProgressBar}
            />

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
