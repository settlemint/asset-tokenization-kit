import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useWizardContext } from "./wizard-context";
import { WizardField } from "./wizard-field";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { createLogger, type LogLevel } from "@settlemint/sdk-utils/logging";
import { toast } from "sonner";
import { formatValidationError } from "@/lib/utils/format-validation-error";

const logger = createLogger({
  level: (process.env.SETTLEMINT_LOG_LEVEL as LogLevel) || "info",
});

interface WizardStepProps {
  className?: string;
}

export function WizardStep({ className }: WizardStepProps) {
  const {
    currentStepIndex,
    steps,
    form,
    nextStep,
    previousStep,
    isFirstStep,
    isLastStep,
    markStepComplete,
    markStepError,
    clearStepError,
  } = useWizardContext();

  const currentStep = steps[currentStepIndex];
  const [isValidating, setIsValidating] = useState(false);
  const [isStepVisible, setIsStepVisible] = useState(true);

  // Check if step should be visible based on dependencies
  useEffect(() => {
    const checkStepVisibility = async () => {
      if (currentStep?.dependsOn) {
        try {
          const formData = form.state.values;
          const shouldShow = await currentStep.dependsOn(formData);
          setIsStepVisible(shouldShow);
          if (!shouldShow) {
            // Skip to next step if current is not visible
            nextStep();
          }
        } catch (error) {
          logger.error("Error checking step dependency", { error, stepId: currentStep.id });
          setIsStepVisible(true);
        }
      }
    };
    checkStepVisibility();
  }, [currentStep, form.state.values, nextStep]);

  // Set up mutation if step has one
  const mutation = currentStep?.mutation
    ? useStreamingMutation({
        mutationOptions: {
          mutationKey: [currentStep.mutation.mutationKey],
          mutationFn: currentStep.mutation.mutationFn,
        },
      })
    : null;

  const handleNext = async () => {
    if (!currentStep) return;

    setIsValidating(true);
    clearStepError(currentStep.id);

    try {
      // Run field validations
      await form.validateAllFields("change");
      
      // Run step validation if provided
      if (currentStep.validate) {
        const error = await currentStep.validate(form.state.values);
        if (error) {
          markStepError(currentStep.id, error);
          toast.error(error);
          return;
        }
      }

      // Run mutation if provided
      if (mutation && currentStep.mutation) {
        await mutation.mutateAsync(form.state.values);
      }

      // Run onStepComplete if provided
      if (currentStep.onStepComplete) {
        await currentStep.onStepComplete(form.state.values);
      }

      // Mark step as complete and move to next
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

  // Default step rendering
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{currentStep.title}</CardTitle>
        {currentStep.description && (
          <CardDescription>{currentStep.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStep.fields?.map((fieldDef) => (
          <WizardField
            key={fieldDef.name as string}
            fieldDef={fieldDef}
            formData={form.state.values}
          />
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={previousStep}
          disabled={isFirstStep}
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={isValidating || mutation?.isPending}
        >
          {isValidating || mutation?.isPending ? (
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
      </CardFooter>
    </Card>
  );
}