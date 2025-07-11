import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStreamingMutation } from "@/hooks/use-streaming-mutation";
import { cn } from "@/lib/utils";
import { formatValidationError } from "@/lib/utils/format-validation-error";
import { createLogger } from "@settlemint/sdk-utils/logging";
import { Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWizardFiltering } from "./use-wizard-filtering";
import { useWizardContext } from "./wizard-context";
import { WizardField } from "./wizard-field";
import { WizardGroup } from "./wizard-group";
import { WizardGroupFilter } from "./wizard-group-filter";
import { WizardSearch } from "./wizard-search";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

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

  // Use the custom hook for filtering logic
  const { matchingFields, matchingGroups, totalResultCount, groupCounts } =
    useWizardFiltering({
      currentStep,
      formValues: form?.state?.values ?? {},
      searchQuery,
      selectedGroupIds,
    });

  // Clear search callback
  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Clear search and group filters when step changes
  useEffect(() => {
    setSearchQuery("");
    setSelectedGroupIds([]);
  }, [currentStepIndex]);

  logger.debug("WizardStep render", {
    currentStepIndex,
    stepsLength: steps.length,
    hasForm: !!form,
    hasCurrentStep: !!currentStep,
    searchQuery,
    totalResultCount,
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

        {/* Search and filter bar - only show if enableFilters is true and there are groups */}
        {currentStep.enableFilters && currentStep.groups && (
          <div className="flex items-center justify-between gap-4 mb-4">
            <WizardSearch
              onSearch={setSearchQuery}
              value={searchQuery}
              resultCount={totalResultCount}
              hasQuery={!!searchQuery.trim()}
            />
            <WizardGroupFilter
              groups={
                typeof currentStep.groups === "function"
                  ? currentStep.groups(form?.state?.values ?? {})
                  : currentStep.groups
              }
              selectedGroupIds={selectedGroupIds}
              onGroupChange={setSelectedGroupIds}
              groupCounts={groupCounts}
            />
          </div>
        )}

        <div className="space-y-6">
          {/* Show no results state when search yields no results */}
          {searchQuery.trim() && totalResultCount === 0 ? (
            <div className="py-8 text-center">
              <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No fields match your search
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search terms or clear the search to see all
                fields.
              </p>
              <Button variant="outline" size="sm" onClick={handleClearSearch}>
                Clear search
              </Button>
            </div>
          ) : (
            <>
              {/* Render matching regular fields */}
              {matchingFields.map((fieldDef) => {
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
              })}

              {/* Render matching groups */}
              {matchingGroups.map((group) => {
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
              })}
            </>
          )}
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
