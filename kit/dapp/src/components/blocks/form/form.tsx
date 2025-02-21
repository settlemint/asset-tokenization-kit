import { AssetFormProgress } from '@/components/blocks/asset-form/asset-form-progress';
import { Card, CardContent } from '@/components/ui/card';
import { Form as UIForm } from '@/components/ui/form';
import type { UseMutationResult } from '@tanstack/react-query';
import { useState } from 'react';
import type { DefaultValues, Path } from 'react-hook-form';
import type { Schema, z } from 'zod';
import { type ButtonLabels, FormButton } from './form-button';
import type { FormStepElement } from './types';
import { useForm } from './use-form';

interface FormProps<InputSchema extends Schema, OutputSchema extends Schema> {
  children: FormStepElement<InputSchema> | FormStepElement<InputSchema>[];
  defaultValues?: DefaultValues<z.infer<InputSchema>>;
  mutation: UseMutationResult<z.infer<OutputSchema>, Error, z.infer<InputSchema>> & {
    inputSchema: InputSchema;
    outputSchema: OutputSchema;
  };
  buttonLabels?: ButtonLabels;
}

export function Form<InputSchema extends Schema, OutputSchema extends Schema>({
  children,
  defaultValues,
  mutation,
  buttonLabels,
}: FormProps<InputSchema, OutputSchema>) {
  const [currentStep, setCurrentStep] = useState(0);

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
    const CurrentStep = Array.isArray(children) ? children[currentStep].type : children.type;
    const fieldsToValidate = CurrentStep.validatedFields;

    if (!fieldsToValidate?.length) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      return;
    }

    // Mark fields as touched
    for (const field of fieldsToValidate) {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const value = form.getValues(field as Path<InputSchema extends Schema ? z.infer<InputSchema> : any>);
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      form.setValue(field as Path<InputSchema extends Schema ? z.infer<InputSchema> : any>, value, {
        shouldValidate: true,
        shouldTouch: true,
      });
    }

    // Validate fields
    const results = await Promise.all(
      fieldsToValidate.map((field) =>
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        form.trigger(field as Path<InputSchema extends Schema ? z.infer<InputSchema> : any>, { shouldFocus: true })
      )
    );

    if (results.every(Boolean)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  return (
    <div className="space-y-6">
      <div className="container mt-8">
        <Card className="w-full pt-10">
          <CardContent>
            <UIForm {...form}>
              <form onSubmit={form.handleSubmit((data) => mutate(data))}>
                {/* Step indicator */}
                {totalSteps > 1 && <AssetFormProgress currentStep={currentStep} totalSteps={totalSteps} />}

                {/* Current step content */}
                <div className="min-h-[400px]">{Array.isArray(children) ? children[currentStep] : children}</div>

                {/* Navigation buttons */}
                <FormButton
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onPreviousStep={handlePrev}
                  onNextStep={handleNext}
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
