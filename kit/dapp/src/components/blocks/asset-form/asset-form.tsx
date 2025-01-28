'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormField } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { waitForTransactionMining } from '@/lib/wait-for-transaction';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import type { Infer, Schema } from 'next-safe-action/adapters/types';
import type { HookSafeActionFn } from 'next-safe-action/hooks';
import type { ComponentProps, ReactElement, ReactNode } from 'react';
import { Children, isValidElement, useEffect, useState } from 'react';
import type { DefaultValues, Path, Resolver } from 'react-hook-form';
import { toast } from 'sonner';

// Helper to extract field names from FormField components
function extractFieldNames(children: ReactNode): Path<ComponentProps<typeof FormField>['name']>[] {
  const fields: Path<ComponentProps<typeof FormField>['name']>[] = [];

  Children.forEach(children, (child: ReactNode) => {
    if (isValidElement(child)) {
      const element = child as ReactElement<{ name?: string; children?: ReactNode }>;

      // Check if it's a FormField component by checking its render output
      if (element.type === FormField && element.props.name) {
        fields.push(element.props.name);
      } else if (element.props.children) {
        // If not a FormField, check its children
        fields.push(...extractFieldNames(element.props.children));
      }
    }
  });

  return fields;
}

export type AssetFormProps<
  ServerError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE,
  CBAVE,
  FormContext = unknown,
> = {
  children: ReactElement[];
  title: string;
  storeAction: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, string>;
  resolverAction: Resolver<Infer<S>, FormContext>;
  defaultValues?: DefaultValues<Infer<S>>;
};

export function AssetForm<
  ServerError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE,
  CBAVE,
  FormContext = unknown,
>({
  children,
  title,
  storeAction,
  resolverAction,
  defaultValues,
}: AssetFormProps<ServerError, S, BAS, CVE, CBAVE, FormContext>) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = children.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Extract field names for each step
  const stepFields = children.map((step) => extractFieldNames(step)) as Path<Infer<S>>[][];
  console.log(stepFields);
  const { form, handleSubmitWithAction } = useHookFormAction(storeAction, resolverAction, {
    actionProps: {
      onSuccess: (data) => {
        if (data.data) {
          toast.promise(waitForTransactionMining(data.data), {
            loading: `Transaction to create ${data.input.name} (${data.input.symbol}) waiting to be mined`,
            success: `${data.input.name} (${data.input.symbol}) created successfully on chain`,
            error: (error) => `Creation of ${data.input.name} (${data.input.symbol}) failed: ${error.message}`,
          });
        }
      },
      onError: (data) => {
        if (data.error.serverError) {
          let errorMessage = 'Unknown server error';
          if (data.error.serverError instanceof Error) {
            errorMessage = data.error.serverError.message;
          } else if (typeof data.error.serverError === 'string') {
            errorMessage = data.error.serverError;
          }

          toast.error(`Server error: ${errorMessage}. Please try again or contact support if the issue persists.`);
        }

        if (data.error.validationErrors) {
          const errors = Object.entries(data.error.validationErrors)
            .map(([field, error]) => `${field}: ${error}`)
            .join('\n');
          toast.error(`Validation errors:\n${errors}`);
        }
      },
    },
    formProps: {
      defaultValues,
      mode: 'all',
      criteriaMode: 'all',
      shouldFocusError: true,
    },
    errorMapProps: {
      joinBy: '\n',
    },
  });

  const handleNext = async () => {
    const currentStepFields = stepFields[currentStep];
    if (!currentStepFields?.length) {
      return;
    }

    // Mark all fields as touched to show validation messages
    for (const field of currentStepFields) {
      const value = form.getValues(field);
      form.setValue(field, value, { shouldValidate: true, shouldTouch: true });
    }

    // Trigger validation for all fields in the current step
    const results = await Promise.all(currentStepFields.map((field) => form.trigger(field, { shouldFocus: true })));
    // Only proceed if all validations pass
    if (results.every(Boolean)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = currentStep === totalSteps - 1;

  if (!mounted) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="container mt-8">
          <Card className="w-full pt-10">
            <CardContent>
              <div className="space-y-6">
                <div className="mb-8 flex gap-2">
                  {Array.from({ length: totalSteps }).map((_, index) => (
                    <div key={index} className="h-1.5 flex-1 rounded-full bg-muted" />
                  ))}
                </div>
                <div className="min-h-[400px]">
                  <Skeleton className="h-[400px]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-bold text-2xl">{title}</h2>
      <div className="container mt-8">
        <Card className="w-full pt-10">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={(e) => {
                  if (!isLastStep) {
                    e.preventDefault();
                    return;
                  }
                  handleSubmitWithAction(e);
                }}
              >
                {/* Step indicator */}
                <div className="mb-8 flex gap-2">
                  {children.map((_, index) => (
                    <div
                      key={index}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors duration-200',
                        index <= currentStep ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  ))}
                </div>

                {/* Current step content */}
                <div className="min-h-[400px]">{children[currentStep]}</div>

                {/* Navigation buttons */}
                <div className="mt-8 flex justify-between">
                  {currentStep > 0 && (
                    <Button type="button" variant="outline" onClick={handlePrev}>
                      Previous
                    </Button>
                  )}

                  <div className="ml-auto">
                    {isLastStep ? (
                      <Button type="submit">Create Asset</Button>
                    ) : (
                      <Button type="button" onClick={handleNext}>
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
