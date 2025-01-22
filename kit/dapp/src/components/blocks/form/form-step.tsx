import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type ReactNode, useEffect, useRef } from 'react';
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
  children,
}: {
  form: UseFormReturn<TFieldValues>;
  children: ReactNode;
  title?: string;
  fields?: TName[];
  withSheetClose?: boolean;
  controls?: {
    prev?: { buttonText: string };
    next?: { buttonText: string };
    submit?: { buttonText: string };
  };
}) => {
  const { currentStep, nextStep, prevStep, totalSteps, registerFormStep, config, validatePage } = useMultiFormStep();

  const [, setStorageState] = useLocalStorage<Record<string, unknown>>('state', {});
  const pageRef = useRef<number | null>(null);
  const page = pageRef.current ?? currentStep ?? 1;

  useEffect(() => {
    if (pageRef.current === null) {
      pageRef.current = registerFormStep();
    }
  }, [registerFormStep]);

  const fieldValues = useWatch({
    control: form.control,
    name: fields,
  });

  const getIsValidPage = () => {
    return page === currentStep && validatePage(fields, form.getValues());
  };

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
      {title && <h3 className="pt-[1.5rem] font-bold">{title}</h3>}
      {children}
      <div className="!mt-8 flex justify-end gap-x-4">
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
          disabled={!getIsValidPage()}
          onClick={() => {
            nextStep();
          }}
        >
          {controls?.next?.buttonText}
        </Button>

        <Button type="submit" className={cn({ hidden: currentStep !== totalSteps })} disabled={!form.formState.isValid}>
          {controls?.submit?.buttonText}
        </Button>
      </div>
    </div>
  );
};
