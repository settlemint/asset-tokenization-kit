import { invalidateQueries } from '@/components/blocks/query-client/query-client';
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
import {
  useQueryClient,
  type QueryKey,
  type UseMutationResult,
} from '@tanstack/react-query';
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
    invalidateKeys: (variables: z.infer<InputSchema>) => QueryKey[];
  };
  buttonLabels?: ButtonLabels;
  onOpenChange?: (open: boolean) => void;
}

export function Form<InputSchema extends Schema, OutputSchema extends Schema>({
  children,
  defaultValues,
  mutation,
  buttonLabels,
  onOpenChange,
}: FormProps<InputSchema, OutputSchema>) {
  const [currentStep, setCurrentStep] = useState(0);
  const tError = useTranslations('errors');
  const tTransaction = useTranslations('transactions');
  const queryClient = useQueryClient();

  const { mutate, inputSchema, invalidateKeys } = mutation;
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
          handleTranslatedError(error, tError, {
            description: tError('formError', {
              defaultValue: 'There was an error processing your request.',
              field: form.formState.errors.root?.message || '',
            }),
          });
        },
        onSuccess(hash) {
          onOpenChange?.(false);
          toast.promise(waitForTransactions(hash), {
            loading: tTransaction('sending', {
              defaultValue: 'Sending transaction {hash}',
              hash,
            }),
            success: (result) => {
              // If the mutation has specified keys to invalidate, use them
              if (invalidateKeys?.length) {
                invalidateQueries(queryClient, invalidateKeys(data));
              }

              return tTransaction('success', {
                defaultValue:
                  'Transaction successfully included in block {blockNumber}',
                blockNumber: result.lastTransaction.receipt.blockNumber,
              });
            },
            error: (error: TransactionError) => {
              return (
                error.message ||
                getTranslatedError(error, tError, {
                  description: tError('formError', {
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
