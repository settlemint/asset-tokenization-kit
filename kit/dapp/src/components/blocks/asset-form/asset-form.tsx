'use client';

import { AssetFormProgress } from '@/components/blocks/asset-form/asset-form-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useInvalidateTags } from '@/hooks/use-invalidate-tags';
import { waitForTransactionMining } from '@/lib/wait-for-transaction';
import { useHookFormAction } from '@next-safe-action/adapter-react-hook-form/hooks';
import type { QueryKey } from '@tanstack/react-query';
import type { Infer, Schema } from 'next-safe-action/adapters/types';
import type { HookSafeActionFn } from 'next-safe-action/hooks';
import type { ComponentType, ReactElement } from 'react';
import { useEffect, useState } from 'react';
import type { Path, Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { AssetFormButton } from './asset-form-button';
import { AssetFormSkeleton } from './asset-form-skeleton';

export type AssetFormProps<
  ServerError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE,
  CBAVE,
  FormContext = unknown,
> = {
  children: ReactElement<unknown, ComponentType & { validatedFields: readonly (keyof Infer<S>)[] }>[];
  storeAction: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, string>;
  resolverAction: Resolver<Infer<S>, FormContext>;
  invalidate: QueryKey[];
  onClose?: () => void;
  submitLabel?: string;
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
  storeAction,
  resolverAction,
  onClose,
  invalidate,
  submitLabel,
}: AssetFormProps<ServerError, S, BAS, CVE, CBAVE, FormContext>) {
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const invalidateTags = useInvalidateTags();
  const totalSteps = children.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  const { form, handleSubmitWithAction, resetFormAndAction } = useHookFormAction(storeAction, resolverAction, {
    actionProps: {
      onSuccess: async ({ data, input }) => {
        if (!data) {
          toast.error('Server error. Please try again or contact support if the issue persists.');
          resetFormAndAction();
          onClose?.();
          return;
        }
        toast.promise(waitForTransactionMining(data), {
          loading: `Transaction to create ${input.assetName} (${input.symbol}) waiting to be mined`,
          success: () => {
            invalidateTags(invalidate);
            return `${input.assetName} (${input.symbol}) created successfully on chain`;
          },
          error: (error) => `Creation of ${input.assetName} (${input.symbol}) failed: ${error.message}`,
        });

        resetFormAndAction();
        onClose?.();
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
        resetFormAndAction();
        onClose?.();
      },
    },
    formProps: {
      mode: 'onSubmit',
      criteriaMode: 'all',
    },
    errorMapProps: {
      joinBy: '\n',
    },
  });

  const handleNext = async () => {
    const CurrentStep = children[currentStep].type as (typeof children)[number]['type'];
    const fieldsToValidate = CurrentStep.validatedFields;

    if (!fieldsToValidate?.length) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      return;
    }

    setIsValidating(true);
    // Mark fields as touched
    for (const field of fieldsToValidate) {
      const value = form.getValues(field as Path<Infer<S>>);
      form.setValue(field as Path<Infer<S>>, value, { shouldValidate: true, shouldTouch: true });
    }

    // Validate fields
    const results = await Promise.all(
      fieldsToValidate.map((field) => form.trigger(field as Path<Infer<S>>, { shouldFocus: true }))
    );

    if (results.every(Boolean)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
    setIsValidating(false);
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = currentStep === totalSteps - 1;

  if (!mounted) {
    return <AssetFormSkeleton totalSteps={totalSteps} />;
  }

  return (
    <div className="space-y-6">
      <div className="container mt-8">
        <Card className="w-full pt-10">
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmitWithAction}>
                {/* Step indicator */}
                <AssetFormProgress currentStep={currentStep} totalSteps={totalSteps} />
                {/* Current step content */}
                <div className="min-h-[400px]">{children[currentStep]}</div>
                {/* Navigation buttons */}
                <AssetFormButton
                  currentStep={currentStep}
                  onPreviousStep={handlePrev}
                  isLastStep={isLastStep}
                  onNextStep={handleNext}
                  isSubmitting={form.formState.isSubmitting || isValidating}
                  submitLabel={submitLabel}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
