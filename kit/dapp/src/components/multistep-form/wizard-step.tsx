import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { cn } from "@/lib/utils";
import { formatValidationError } from "@/lib/utils/format-validation-error";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWizardContext } from "./wizard-context";
import { WizardField } from "./wizard-field";
import { WizardGroup } from "./wizard-group";

const logger = createLogger();

interface WizardStepProps {
  className?: string;
}

// Default no-op functions to avoid creating new functions in render
const noop = () => {
  /* no-op */
};

export function WizardStep({ className }: WizardStepProps) {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const [isValidating, setIsValidating] = useState(false);
  const [isStepVisible, setIsStepVisible] = useState(true);

  // Get context - this hook must always be called
  const context = useWizardContext();

  // Check if context is valid - context should always be available due to useWizardContext hook
  const contextError: string | null = null;

  // Extract context values safely
  const {
    currentStepIndex = 0,
    steps = [],
    form = null,
    nextStep = noop,
    previousStep = noop,
    isFirstStep = true,
    isLastStep = false,
    markStepComplete = noop,
    markStepError = noop,
    clearStepError = noop,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } = context || {};

  // Get current step safely
  const currentStep = steps[currentStepIndex];

  // Set up mutation hook (must always be called to satisfy Rules of Hooks)
  const mutation = useStreamingMutation({
    mutationOptions: {
      mutationKey: [currentStep?.mutation?.mutationKey ?? "no-mutation"],
      mutationFn:
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (currentStep?.mutation?.mutationFn as any) ?? (() => null), // Type assertion for now
    },
  });

  // Only use mutation if the step actually has one
  const shouldUseMutation = !!currentStep?.mutation;

  logger.debug("WizardStep render", {
    currentStepIndex,
    stepsLength: steps.length,
    hasForm: !!form,
    hasCurrentStep: !!currentStep,
  });

  // Define handleNext with useCallback before any conditional returns
  const handleNext = useCallback(async () => {
    if (!currentStep) return;

    setIsValidating(true);
    clearStepError(currentStep.id);

    try {
      // Run step validation if provided
      if (currentStep.validate && form?.state?.values) {
        const error = await currentStep.validate(form.state.values);
        if (error) {
          markStepError(currentStep.id, error);
          toast.error(error);
          return;
        }
      }

      // Run mutation if provided
      if (shouldUseMutation && form?.state?.values) {
        await mutation.mutateAsync(form.state.values);
      }

      // Run onStepComplete if provided
      if (currentStep.onStepComplete && form?.state?.values) {
        await currentStep.onStepComplete(form.state.values);
      }

      // Mark step as complete and move to next
      markStepComplete(currentStep.id);

      if (!isLastStep) {
        nextStep();
      } else {
        // Final submission - call the form's onSubmit handler directly
        if (form?.options?.onSubmit && form?.state?.values) {
          await form.options.onSubmit({
            value: form.state.values,
            formApi: form,
          });
        }
      }
    } catch (error) {
      const errorMessage = formatValidationError(error);
      markStepError(currentStep.id, errorMessage);
      toast.error(errorMessage, {
        duration: 10000,
        description: "Check browser console for details",
      });
      logger.error("Step validation failed", { error, stepId: currentStep.id });
    } finally {
      setIsValidating(false);
    }
  }, [
    currentStep,
    clearStepError,
    form,
    markStepError,
    shouldUseMutation,
    mutation,
    markStepComplete,
    isLastStep,
    nextStep,
    setIsValidating,
  ]);

  // Check if step should be visible based on dependencies
  useEffect(() => {
    const checkStepVisibility = async () => {
      if (currentStep?.dependsOn && form?.state?.values) {
        try {
          const formData = form.state.values;
          const shouldShow = await currentStep.dependsOn(formData);
          setIsStepVisible(shouldShow);
          if (!shouldShow) {
            // Skip to next step if current is not visible
            nextStep();
          }
        } catch (error) {
          logger.error("Error checking step dependency", {
            error,
            stepId: currentStep.id,
          });
          setIsStepVisible(true);
        }
      }
    };
    void checkStepVisibility();
  }, [currentStep, form?.state?.values, nextStep]);

  // NOW handle conditional rendering after all hooks have been called
  // contextError is always null, but keeping this for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (contextError) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-destructive">{contextError}</p>
        </CardContent>
      </Card>
    );
  }

  if (!currentStep) {
    logger.error("No step found for current index", {
      currentStepIndex,
      totalSteps: steps.length,
    });
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Step not found. Please refresh the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!form?.state) {
    logger.debug("Form not yet initialized", {
      hasForm: !!form,
      hasFormState: !!form?.state,
    });
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Initializing form...
          </p>
        </CardContent>
      </Card>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!currentStep || !isStepVisible) {
    return null;
  }

  // Use custom component if provided
  if (currentStep.component) {
    const Component = currentStep.component;

    return (
      <Component
        form={form}
        stepId={currentStep.id}
        onNext={handleNext}
        onPrevious={previousStep}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
      />
    );
  }

  // Default step rendering with StepWizard-style layout
  return (
    <div className={cn("h-full flex flex-col", className)}>
      {/* Content area */}
      <div className="flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {currentStep.title}
          </h1>
          {currentStep.description && (
            <p className="text-muted-foreground">{currentStep.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {/* Render regular fields */}
          {(() => {
            if (!currentStep.fields) return null;

            // Handle both static array and function-based fields
            const fields =
              typeof currentStep.fields === "function"
                ? currentStep.fields(form?.state?.values ?? {})
                : currentStep.fields;

            return fields.map((fieldDef) => {
              try {
                return (
                  <WizardField
                    key={fieldDef.name as string}
                    fieldDef={fieldDef}
                    formData={form?.state?.values ?? {}}
                  />
                );
              } catch (error) {
                logger.error("Error rendering field", {
                  fieldName: fieldDef.name,
                  error,
                  hasForm: !!form,
                  hasFormState: !!form.state,
                });
                return (
                  <div
                    key={fieldDef.name as string}
                    className="text-destructive"
                  >
                    Error rendering field: {fieldDef.name as string}
                  </div>
                );
              }
            });
          })()}

          {/* Render groups */}
          {(() => {
            if (!currentStep.groups) return null;

            // Handle both static array and function-based groups
            const groups =
              typeof currentStep.groups === "function"
                ? currentStep.groups(form?.state?.values ?? {})
                : currentStep.groups;

            return groups.map((group) => {
              try {
                return (
                  <WizardGroup
                    key={group.id}
                    group={group}
                    formData={form?.state?.values ?? {}}
                  />
                );
              } catch (error) {
                logger.error("Error rendering group", {
                  groupId: group.id,
                  error,
                  hasForm: !!form,
                  hasFormState: !!form.state,
                });
                return (
                  <div key={group.id} className="text-destructive">
                    Error rendering group: {group.id}
                  </div>
                );
              }
            });
          })()}
        </div>
      </div>

      {/* Navigation buttons - positioned at bottom */}
      <div className="mt-8 pt-6 border-t border-border">
        <div className="flex justify-end gap-3">
          {!isFirstStep && (
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={
                isValidating || (shouldUseMutation && mutation.isPending)
              }
              className="transition-all duration-200"
            >
              Previous
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={isValidating || (shouldUseMutation && mutation.isPending)}
            className="transition-all duration-200"
          >
            {isValidating || (shouldUseMutation && mutation.isPending) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isLastStep ? (
              "Complete"
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
