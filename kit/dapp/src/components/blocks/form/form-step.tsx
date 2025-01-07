'use client';

import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Fragment, type ReactNode, useEffect, useRef, useState } from 'react';
import { type FieldPath, type FieldValues, type UseFormReturn, useWatch } from 'react-hook-form';
import { useLocalStorage } from 'usehooks-ts';
import { useMultiFormStep } from './form-multistep';

export const FormStep = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  title,
  form,
  fields = [],
  controls,
  withSheetClose,
  children,
}: {
  title?: string;
  form: UseFormReturn<TFieldValues>;
  fields?: TName[];
  children: ReactNode;
  withSheetClose?: boolean;
  controls?: {
    prev?: { buttonText: string };
    next?: { buttonText: string };
    submit?: { buttonText: string };
  };
}) => {
  const { currentStep, nextStep, prevStep, totalSteps, registerFormStep, config } = useMultiFormStep();
  const [SheetCloseWrapper, sheetCloseWrapperProps] = withSheetClose ? [SheetClose, { asChild: true }] : [Fragment, {}];

  const [, setStorageState] = useLocalStorage<Record<string, unknown>>('state', {});
  const [isNavigate, setIsNavigate] = useState(true);
  const pageRef = useRef<number | null>(null);
  const page = pageRef.current ?? currentStep ?? 1;

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (pageRef.current === null) {
      pageRef.current = registerFormStep();
    }
  }, [registerFormStep]);

  const fieldValues = useWatch({
    control: form.control,
    name: fields,
  });

  const isValidPage =
    page === currentStep &&
    fields
      .map((field) => {
        const fieldState = form.getFieldState(field);
        return !fieldState.invalid;
      })
      .every((isValid) => isValid);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setIsNavigate(false);
    const navigationEntry = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const navigationType = navigationEntry?.type;
    async function triggerFields() {
      if (page === currentStep) {
        await form.trigger(fields);
      }
      const validFields = fields.map((field) => {
        const fieldState = form.getFieldState(field);
        return !fieldState.invalid;
      });
      const isValid = validFields.every((isValid) => isValid);
      return isValid;
    }

    if (navigationType === 'reload') {
      triggerFields().then((isValid) => {
        if (page === currentStep) {
          setIsValid(isValid);
        }
      });
      const validFields = fields.map((field) => {
        const fieldState = form.getFieldState(field);
        return !fieldState.invalid;
      });
      const isValid = validFields.every((isValid) => isValid);
      if (page === currentStep) {
        setIsValid(isValid);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const navigationEntry = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const navigationType = navigationEntry?.type;

    if (navigationType === 'navigate') {
      setIsNavigate(true);
      const validFields = fields.map((field) => {
        const fieldState = form.getFieldState(field);
        return !fieldState.invalid;
      });

      const dirtyFields = fields.map((field) => {
        const fieldState = form.getFieldState(field);
        return fieldState.isDirty;
      });

      const isValid = validFields.every((isValid) => isValid);
      const isDirty = dirtyFields.length > 0 ? dirtyFields.every((isDirty) => isDirty) : true;
      if (page === currentStep) {
        setIsValid(isValid && isDirty);
      }
    }
  }, [fields, form, page, currentStep]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (config.useLocalStorageState) {
      const fieldState = Object.fromEntries(fields.map((key, index) => [key, fieldValues[index]]));
      if (page === currentStep) {
        setStorageState((prevState) => {
          return {
            ...prevState,
            ...fieldState,
          };
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldValues, page, currentStep]);

  return (
    <div className={`${cn('FormStep space-y-4', { hidden: page !== currentStep })}`}>
      {title && <h3>{title}</h3>}
      {children}
      <div className="!mt-16 flex justify-end gap-x-4">
        <Button
          type="button"
          variant="outline"
          className={cn({ hidden: currentStep === 1 })}
          onClick={() => prevStep()}
        >
          {controls?.prev?.buttonText}
        </Button>
        <Button
          type="button"
          className={cn({ hidden: currentStep === totalSteps })}
          disabled={(!isValid && isNavigate) || (!isValidPage && !isNavigate)}
          onClick={() => {
            nextStep();
          }}
        >
          {controls?.next?.buttonText}
        </Button>

        <SheetCloseWrapper {...sheetCloseWrapperProps}>
          <Button
            type="submit"
            className={cn({ hidden: currentStep !== totalSteps })}
            disabled={!form.formState.isValid}
          >
            {controls?.submit?.buttonText}
          </Button>
        </SheetCloseWrapper>
      </div>
    </div>
  );
};
