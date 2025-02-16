'use client';
import { revalidatePaths } from '@/app/_actions/revalidate';
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

type AssetFormMessages<T> = {
  onCreate: (input: T) => string;
  onSuccess: (input: T) => string;
  onError: (input: T, error: Error) => string;
};

const defaultMessages = <T,>(): AssetFormMessages<T> => ({
  onCreate: () => 'Transaction sent. Waiting for confirmation...',
  onSuccess: () => 'Transaction confirmed successfully',
  onError: (_, error: Error) => `Transaction failed: ${error.message}`,
});

export type CacheInvalidationConfig<S extends Schema> = {
  /**
   * Array of React Query keys to invalidate in the client-side cache.
   * Use this for refreshing client-side data fetched with React Query.
   * @example ['users', 'userList']
   */
  clientCacheKeys: QueryKey[];

  /**
   * Function to generate the server-side cache path that should be revalidated.
   * Use this for refreshing Next.js server-side rendered (SSR) or statically generated pages.
   * @example (input) => `/users/${input.id}`
   */
  serverCachePath?: (input: Infer<S>) => string;
};

type FormStepComponent<S extends Schema> = ComponentType & {
  validatedFields: readonly (keyof Infer<S>)[];
};

type FormStepElement<S extends Schema> = ReactElement<unknown, FormStepComponent<S>>;

export type AssetFormProps<
  ServerError,
  S extends Schema,
  BAS extends readonly Schema[],
  CVE,
  CBAVE,
  FormContext = unknown,
> = {
  children: FormStepElement<S> | FormStepElement<S>[]; // Accepts a single component or an array of components
  storeAction: HookSafeActionFn<ServerError, S, BAS, CVE, CBAVE, string>;
  resolverAction: Resolver<Infer<S>, FormContext>;
  onClose?: () => void;
  /**
   * Configuration for cache invalidation after successful form submission.
   * Handles both client-side and server-side cache updates.
   */
  cacheInvalidation: CacheInvalidationConfig<S>;
  submitLabel?: string;
  submittingLabel?: string;
  processingLabel?: string;
  messages?: Partial<AssetFormMessages<Infer<S>>>;
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
  cacheInvalidation,
  submitLabel,
  submittingLabel,
  processingLabel,
  messages: customMessages = {},
}: AssetFormProps<ServerError, S, BAS, CVE, CBAVE, FormContext>) {
  const defaultMessageHandlers = defaultMessages<Infer<S>>();
  const messages = {
    ...defaultMessageHandlers,
    ...customMessages,
  };

  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [, setIsValidating] = useState(false);
  const invalidateTags = useInvalidateTags();
  const totalSteps = Array.isArray(children) ? children.length : 1;

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
          loading: messages.onCreate(input as Infer<S>),
          success: async () => {
            // Invalidate both client and server caches
            await Promise.all([
              invalidateTags(cacheInvalidation.clientCacheKeys),
              cacheInvalidation.serverCachePath
                ? revalidatePaths([cacheInvalidation.serverCachePath(input as Infer<S>)])
                : Promise.resolve(),
            ]);
            return messages.onSuccess(input as Infer<S>);
          },
          error: (error: Error) => messages.onError(input as Infer<S>, error),
        });

        resetFormAndAction();
        onClose?.();
      },
      onError: (data) => {
        if (data.error.serverError) {
          let errorMessage = 'Unknown server error';
          const serverErrorWithContext = data.error.serverError as
            | (typeof data.error.serverError & {
                context?: { details: string };
              })
            | string;
          if (serverErrorWithContext instanceof Error) {
            errorMessage = serverErrorWithContext.message;
          } else if (typeof serverErrorWithContext === 'string') {
            errorMessage = serverErrorWithContext;
          } else if (
            typeof serverErrorWithContext === 'object' &&
            typeof serverErrorWithContext.context?.details === 'string'
          ) {
            errorMessage = serverErrorWithContext.context.details;
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

  const { errors } = form.formState;

  const handleNext = async () => {
    const CurrentStep = Array.isArray(children) ? children[currentStep].type : children.type;
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
                {totalSteps > 1 && <AssetFormProgress currentStep={currentStep} totalSteps={totalSteps} />}
                {/* Current step content */}
                <div className="min-h-[400px]">{Array.isArray(children) ? children[currentStep] : children}</div>
                {/* Navigation buttons */}
                <AssetFormButton
                  currentStep={currentStep}
                  onPreviousStep={handlePrev}
                  onNextStep={handleNext}
                  isLastStep={isLastStep}
                  isSubmitting={form.formState.isSubmitting}
                  hasErrors={Object.keys(errors).length > 0}
                  submitLabel={submitLabel}
                  submittingLabel={submittingLabel}
                  processingLabel={processingLabel}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
