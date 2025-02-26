import { Card, CardContent } from '@/components/ui/card';
import { Form as UIForm } from '@/components/ui/form';
import {
  getTranslatedError,
  handleTranslatedError,
} from '@/lib/utils/error-handler';
import {
  waitForTransactions,
  type TransactionError,
} from '@/lib/wait-for-transaction';
import type { UseMutationResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { DefaultValues, Path } from 'react-hook-form';
import { toast } from 'sonner';
import type { Schema, z } from 'zod';
import { FormButton, type ButtonLabels } from './form-button';
import { FormProgress } from './form-progress';
import type { FormStepElement } from './types';
import { useForm } from './use-form';

interface FormProps<InputSchema extends Schema, OutputSchema extends Schema> {
  children: FormStepElement<InputSchema> | FormStepElement<InputSchema>[];
  defaultValues?: DefaultValues<z.infer<InputSchema>>;
  mutation: UseMutationResult<
    z.infer<OutputSchema>,
    Error,
    z.infer<InputSchema>
  > & {
    inputSchema: InputSchema;
    outputSchema: OutputSchema;
  };
  buttonLabels?: ButtonLabels;
  onOpenChange?: (open: boolean) => void;
  messages?: {
    namespace?: string;
    loading?: string;
    success?: string;
    error?: string;
  };
}

export function Form<InputSchema extends Schema, OutputSchema extends Schema>({
  children,
  defaultValues,
  mutation,
  buttonLabels,
  onOpenChange,
  messages,
}: FormProps<InputSchema, OutputSchema>) {
  const [currentStep, setCurrentStep] = useState(0);
  const errorT = useTranslations('errors');
  const messageT = useTranslations(messages?.namespace || 'form');

  const { mutate, inputSchema } = mutation;
  const totalSteps = Array.isArray(children) ? children.length : 1;

  const form = useForm({
    defaultValues,
    inputSchema,
  });

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = async () => {
    const CurrentStep = Array.isArray(children)
      ? children[currentStep].type
      : children.type;
    const fieldsToValidate = CurrentStep.validatedFields;

    if (!fieldsToValidate?.length) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      return;
    }

    // Mark fields as touched
    for (const field of fieldsToValidate) {
      const value = form.getValues(
        field as Path<InputSchema extends Schema ? z.infer<InputSchema> : any>
      );

      form.setValue(
        field as Path<InputSchema extends Schema ? z.infer<InputSchema> : any>,
        value,
        {
          shouldValidate: true,
          shouldTouch: true,
        }
      );
    }

    // Validate fields
    const results = await Promise.all(
      fieldsToValidate.map((field) =>
        form.trigger(
          field as Path<
            InputSchema extends Schema ? z.infer<InputSchema> : any
          >,
          { shouldFocus: true }
        )
      )
    );

    if (results.every(Boolean)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    void form.handleSubmit((data) => {
      mutate(data, {
        onError(error) {
          onOpenChange?.(false);
          handleTranslatedError(error, errorT, {
            description: errorT('formError', {
              defaultValue: 'There was an error processing your request.',
              field: form.formState.errors.root?.message || '',
            }),
          });
        },
        onSuccess({ data, input }) {
          onOpenChange?.(false);
          toast.promise(waitForTransactions(data), {
            loading: messages?.loading
              ? messageT(messages.loading, { txHash: data })
              : `Sending transaction ${data}`,
            success: (result) => {
              return messages?.success
                ? messageT(messages.success, {
                    blockNumber: result.lastTransaction.receipt.blockNumber,
                    data,
                    ...input,
                  })
                : `Transaction successfully included in block ${result.lastTransaction.receipt.blockNumber}`;
            },
            error: (error: TransactionError) => {
              if (messages?.error) {
                return messageT(messages.error, {
                  error: error.message,
                  ...input,
                });
              }

              return (
                error.message ||
                getTranslatedError(error, errorT, {
                  description: errorT('formError', {
                    defaultValue: 'There was an error processing your request.',
                    field: form.formState.errors.root?.message || '',
                  }),
                }).message
              );
            },
          });
        },
      });
    })(event);
  };

  console.log('Form errors', form.formState.errors);

  return (
    <div className="space-y-6">
      <div className="container mt-8">
        <Card className="w-full pt-10">
          <CardContent>
            <UIForm {...form}>
              <form onSubmit={handleSubmit}>
                {totalSteps > 1 && (
                  <FormProgress
                    currentStep={currentStep}
                    totalSteps={totalSteps}
                  />
                )}
                <div className="min-h-[400px]">
                  {Array.isArray(children) ? children[currentStep] : children}
                </div>
                <FormButton
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onPreviousStep={handlePrev}
                  onNextStep={() => {
                    void handleNext();
                  }}
                  labels={buttonLabels}
                />
              </form>
            </UIForm>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
