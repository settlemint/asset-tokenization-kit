import { Card, CardContent } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { waitForTransactionMining } from '@/lib/wait-for-transaction';
import { zodResolver } from '@hookform/resolvers/zod';
import { type QueryKey, type UseMutationResult, useQueryClient } from '@tanstack/react-query';
import type { Infer, Schema } from 'next-safe-action/adapters/types';
import type { ComponentType, ReactElement } from 'react';
import { useState } from 'react';
import { type DefaultValues, type Path, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type { ZodType } from 'zod';
import { AssetFormButton, type ButtonLabels } from './asset-form-button';
import { AssetFormProgress } from './asset-form-progress';

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

type FormStepComponent<S extends Schema> = ComponentType & {
  validatedFields: readonly (keyof Infer<S>)[];
};

type FormStepElement<S extends Schema> = ReactElement<unknown, FormStepComponent<S>>;

export type AssetFormProps<S extends Schema> = {
  // biome-ignore lint/suspicious/noExplicitAny: required for zod resolver
  formSchema: ZodType<any, any, any>;
  children: FormStepElement<S> | FormStepElement<S>[]; // Accepts a single component or an array of components
  // biome-ignore lint/suspicious/noExplicitAny: required for useMutation
  mutate: UseMutationResult<any, Error, any, unknown>['mutate'];
  onClose?: () => void;
  button?: ButtonLabels;
  messages?: Partial<AssetFormMessages<Infer<S>>>;
  defaultValues?: DefaultValues<Infer<S>>;
  queryKey: QueryKey;
};

export function AssetForm<S extends Schema>({
  formSchema,
  children,
  mutate,
  onClose,
  button,
  messages: customMessages = {},
  defaultValues,
  queryKey,
}: AssetFormProps<S>) {
  const defaultMessageHandlers = defaultMessages<Infer<S>>();
  const messages = {
    ...defaultMessageHandlers,
    ...customMessages,
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [, setIsValidating] = useState(false);
  const queryClient = useQueryClient();
  const totalSteps = Array.isArray(children) ? children.length : 1;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onSubmit',
    criteriaMode: 'all',
    shouldUseNativeValidation: true,
  });

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
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const value = form.getValues(field as Path<S extends Schema ? Infer<S> : any>);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      form.setValue(field as Path<S extends Schema ? Infer<S> : any>, value, {
        shouldValidate: true,
        shouldTouch: true,
      });
    }

    // Validate fields
    const results = await Promise.all(
      fieldsToValidate.map((field) =>
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        form.trigger(field as Path<S extends Schema ? Infer<S> : any>, { shouldFocus: true })
      )
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

  return (
    <div className="space-y-6">
      <div className="container mt-8">
        <Card className="w-full pt-10">
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) =>
                  mutate(data, {
                    onSuccess: () => {
                      toast.promise(waitForTransactionMining(data), {
                        loading: messages.onCreate(data),
                        success: async () => {
                          await queryClient.invalidateQueries({ queryKey });
                          return messages.onSuccess(data);
                        },
                        error: (error: Error) => messages.onError(data, error),
                      });

                      form.reset();
                      onClose?.();
                    },
                    onError: (error) => {
                      toast.error(`Transaction failed: ${error.message}`);
                    },
                  })
                )}
              >
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
                  hasErrors={Object.keys(form.formState.errors).length > 0}
                  button={button}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
