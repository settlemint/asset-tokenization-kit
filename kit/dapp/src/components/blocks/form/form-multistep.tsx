'use client';
import { Form } from '@/components/ui/form';
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs';
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { FieldValues, UseFormReturn } from 'react-hook-form';

type FormMultiStepConfig = {
  useLocalStorageState?: boolean;
};

interface FormMultiStepContextType<T extends FieldValues> {
  currentStep: number;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  totalSteps: number;
  setTotalSteps: React.Dispatch<React.SetStateAction<number>>;
  registerFormStep: () => number;
  config: FormMultiStepConfig;
  form: UseFormReturn<T>;
  formId: string;
}

const FormMultiStepContext = createContext<FormMultiStepContextType<FieldValues> | undefined>(undefined);

export const FormMultiStep = <T extends FieldValues>({
  children,
  config = { useLocalStorageState: false },
  form,
  formId,
  onSubmit,
}: React.PropsWithChildren<{
  config: FormMultiStepConfig;
  form: UseFormReturn<T>;
  formId: string;
  onSubmit: (values: T) => void;
}>) => {
  const [currentStep, setCurrentStep] = useQueryState('currentStep', parseAsInteger.withDefault(1));
  const [_formId] = useQueryState('formId', parseAsString.withDefault(formId));
  const [totalSteps, setTotalSteps] = useState<number>(1);
  const pageCounterRef = useRef(1);

  if (config.useLocalStorageState === false && typeof window !== 'undefined') {
    window.localStorage.removeItem('state');
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));
  const goToStep = (step: number) => setCurrentStep(Math.min(Math.max(step, 0), totalSteps - 1));

  const registerFormStep = useCallback(() => {
    const pageNumber = pageCounterRef.current;
    setTotalSteps((prev) => Math.max(prev, pageNumber));
    pageCounterRef.current += 1;
    return pageNumber;
  }, []);

  return (
    <FormMultiStepContext.Provider
      value={{
        currentStep,
        nextStep,
        prevStep,
        goToStep,
        totalSteps,
        setTotalSteps,
        registerFormStep,
        config,
        form: form as UseFormReturn<FieldValues>,
        formId: formId ?? _formId,
      }}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {children}
        </form>
      </Form>
    </FormMultiStepContext.Provider>
  );
};

export const useMultiFormStep = <T extends FieldValues>(): FormMultiStepContextType<T> => {
  const context = useContext(FormMultiStepContext as React.Context<FormMultiStepContextType<T> | undefined>);
  if (!context) {
    throw new Error('useMultiFormStep must be used within a FormMultiStep');
  }
  return context;
};
