import { useCallback, useMemo, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
// Logger import removed as it's not used
import { WizardProvider } from "./wizard-context";
import { WizardSidebar } from "./wizard-sidebar";
import { WizardStep } from "./wizard-step";
import { useMultiStepWizardState } from "./use-multistep-wizard-state";
import type { MultiStepWizardProps, WizardContextValue } from "./types";

// Note: Logger removed as it's not used in this component

export function MultiStepWizard<TFormData = Record<string, unknown>>({
  name,
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
  persistFormData = true,
}: MultiStepWizardProps<TFormData>) {
  const {
    currentStepIndex,
    completedSteps,
    stepErrors,
    formData,
    setCurrentStepIndex,
    setCompletedSteps,
    setStepErrors,
    updateFormData,
    reset,
  } = useMultiStepWizardState({
    name,
    enableUrlPersistence,
    debounceMs,
    defaultState: {
      currentStepIndex: 0,
      completedSteps: [],
      stepErrors: {},
      formData: defaultValues as Record<string, unknown>,
    },
  });

  // Create form with TanStack Form
  const form = useForm<TFormData>({
    defaultValues: (persistFormData ? formData : defaultValues) as TFormData,
    onSubmit: async ({ value }) => {
      await onComplete(value);
      reset();
    },
    validatorAdapter: zodValidator(),
  });

  // Update persisted form data when form values change
  useEffect(() => {
    if (persistFormData) {
      const unsubscribe = form.Subscribe({
        selector: (state) => state.values,
        fn: (values) => {
          updateFormData(values as Record<string, unknown>);
        },
      });
      return unsubscribe;
    }
  }, [form, persistFormData, updateFormData]);

  // Calculate progress
  const progress = useMemo(() => {
    return (completedSteps.length / steps.length) * 100;
  }, [completedSteps.length, steps.length]);

  // Navigation functions
  const canNavigateToStep = useCallback(
    (stepIndex: number) => {
      if (stepIndex < 0 || stepIndex >= steps.length) return false;
      if (stepIndex === currentStepIndex) return true;
      if (allowStepSkipping) return true;
      
      // Can only navigate to completed steps or the next step
      const targetStep = steps[stepIndex];
      if (!targetStep) return false;
      return completedSteps.includes(targetStep.id) || stepIndex === currentStepIndex + 1;
    },
    [steps, currentStepIndex, completedSteps, allowStepSkipping]
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
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, steps.length, setCurrentStepIndex]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex, setCurrentStepIndex]);

  const markStepComplete = useCallback(
    (stepId: string) => {
      if (!completedSteps.includes(stepId)) {
        setCompletedSteps([...completedSteps, stepId]);
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

  // Create context value
  const contextValue: WizardContextValue<TFormData> = {
    currentStepIndex,
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
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === steps.length - 1,
    resetWizard,
  };

  return (
    <WizardProvider value={contextValue}>
      <div className={cn("flex gap-6", className)}>
        {/* Sidebar */}
        <aside className={cn("w-64 shrink-0", sidebarClassName)}>
          <div className="sticky top-4 space-y-4">
            {showProgressBar && (
              <div className="px-4">
                <div className="text-sm font-medium mb-2">
                  Progress: {Math.round(progress)}%
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            <WizardSidebar />
          </div>
        </aside>

        {/* Main content */}
        <main className={cn("flex-1", contentClassName)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <WizardStep />
          </form>
        </main>
      </div>
    </WizardProvider>
  );
}