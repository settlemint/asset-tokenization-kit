import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useWizardContext } from "./wizard-context";
import { WizardField } from "./wizard-field";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { toast } from "sonner";
import { formatValidationError } from "@/lib/utils/format-validation-error";
import { cn } from "@/lib/utils";

const logger = createLogger({
  level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info",
});

interface WizardStepProps {
  className?: string;
}

export function WizardStep({ className }: WizardStepProps) {
  // ALL HOOKS MUST BE CALLED FIRST - before any conditional returns
  const [isValidating, setIsValidating] = useState(false);
  const [isStepVisible, setIsStepVisible] = useState(true);

  // Get context with error handling
  let context;
  let contextError: string | null = null;
  try {
    context = useWizardContext();
  } catch (error) {
    logger.error("Failed to get wizard context", { error });
    contextError = "Wizard context error. Please refresh the page.";
  }

  // Extract context values safely
  const {
    currentStepIndex = 0,
    steps = [],
    form = null,
    nextStep = () => {},
    previousStep = () => {},
    isFirstStep = true,
    isLastStep = false,
    markStepComplete = () => {},
    markStepError = () => {},
    clearStepError = () => {},
  } = context || {};

  // Get current step safely
  const currentStep = steps?.[currentStepIndex];

  // Set up mutation hook (must always be called to satisfy Rules of Hooks)
  const mutation = useStreamingMutation({
    mutationOptions: {
      mutationKey: [currentStep?.mutation?.mutationKey || "no-mutation"],
      mutationFn:
        (currentStep?.mutation?.mutationFn as any) || (async () => null), // Type assertion for now
    },
  });

  // Only use mutation if the step actually has one
  const shouldUseMutation = !!currentStep?.mutation;

  logger.debug("WizardStep render", {
    currentStepIndex,
    stepsLength: steps?.length,
    hasForm: !!form,
    hasCurrentStep: !!currentStep,
  });

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
    checkStepVisibility();
  }, [currentStep, form?.state?.values, nextStep]);

  // NOW handle conditional rendering after all hooks have been called
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
      totalSteps: steps?.length,
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

  const handleNext = async () => {
    if (!currentStep) return;

    setIsValidating(true);
    clearStepError(currentStep.id);

    try {
      // Run field validations
      if (form?.validateAllFields) {
        await form.validateAllFields("change");
      }

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
      console.log('WizardStep: Marking step complete:', currentStep.id);
      markStepComplete(currentStep.id);

      if (!isLastStep) {
        nextStep();
      } else {
        // Final submission
        await new Promise<void>((resolve, reject) => {
          form.handleSubmit({
            onSubmit: async ({ value }: { value: unknown }) => {
              try {
                await form.options.onSubmit?.({ value, formApi: form });
                resolve();
              } catch (error) {
                reject(error);
              }
            },
          })();
        });
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
  };

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
          {currentStep.fields?.map((fieldDef) => {
            try {
              return (
                <WizardField
                  key={fieldDef.name as string}
                  fieldDef={fieldDef}
                  formData={form?.state?.values || {}}
                />
              );
            } catch (error) {
              logger.error("Error rendering field", {
                fieldName: fieldDef.name,
                error,
                hasForm: !!form,
                hasFormState: !!form?.state,
              });
              return (
                <div key={fieldDef.name as string} className="text-destructive">
                  Error rendering field: {fieldDef.name as string}
                </div>
              );
            }
          })}
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
                isValidating || (shouldUseMutation && mutation?.isPending)
              }
              className="transition-all duration-200"
            >
              Previous
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={
              isValidating || (shouldUseMutation && mutation?.isPending)
            }
            className="transition-all duration-200"
          >
            {isValidating || (shouldUseMutation && mutation?.isPending) ? (
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
