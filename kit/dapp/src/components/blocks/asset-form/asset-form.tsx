'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, type FormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { waitForTransactionMining } from '@/lib/wait-for-transaction';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import type { Infer, Schema } from 'next-safe-action/adapters/types';
import type { HookSafeActionFn } from 'next-safe-action/hooks';
import type { ComponentProps, JSXElementConstructor, ReactElement, ReactNode } from 'react';
import { Children, isValidElement, useState } from 'react';
import type { DefaultValues, Path, Resolver } from 'react-hook-form';
import { toast } from 'sonner';

// Helper to extract field names from FormField components
function extractFieldNames(children: ReactNode): Path<ComponentProps<typeof FormField>['name']>[] {
  const fields: Path<ComponentProps<typeof FormField>['name']>[] = [];

  Children.forEach(children, (child: ReactNode) => {
    if (isValidElement(child)) {
      const element = child as ReactElement<{ name?: string; children?: ReactNode }>;
      // Check if it's a FormField component
      if ((element.type as JSXElementConstructor<unknown>)?.name === 'FormField' && element.props.name) {
        fields.push(element.props.name);
      }
      // Recursively check children
      if (element.props.children) {
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
  defaultValues: DefaultValues<Infer<S>>;
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
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = children.length;

  // Extract field names for each step
  const stepFields = children.map((step) => extractFieldNames(step)) as Path<Infer<S>>[][];

  const { form, handleSubmitWithAction } = useHookFormAction(storeAction, resolverAction, {
    actionProps: {
      onSuccess: (data) => {
        if (data.data) {
          toast.promise(waitForTransactionMining(data.data), {
            loading: `Transaction to create ${data.input.tokenName} (${data.input.tokenSymbol}) waiting to be mined`,
            success: `${data.input.tokenName} (${data.input.tokenSymbol}) created successfully on chain`,
            error: (error) =>
              `Creation of ${data.input.tokenName} (${data.input.tokenSymbol}) failed: ${error.message}`,
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
      defaultValues: defaultValues,
      shouldFocusError: true,
      shouldUseNativeValidation: true,
    },
    errorMapProps: {
      joinBy: '\n',
    },
  });

  const handleNext = async () => {
    const currentStepFields = stepFields[currentStep];
    const isValid = await form.trigger(currentStepFields as Path<Infer<S>>[]);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = currentStep === totalSteps - 1;

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
