import type { ZodInfer, ZodType } from '@/lib/utils/zod';
import type { ComponentType, ReactElement } from 'react';
import type { UseFormReturn } from 'react-hook-form';

export type Schema = ZodType;
export type ValidatedFields<S extends Schema> = {
  validatedFields: readonly (keyof ZodInfer<S>)[];
};

export type FormStepComponent<S extends Schema> = ComponentType & {
  validatedFields: readonly (keyof ZodInfer<S>)[];
  beforeValidate?: ((form: UseFormReturn<ZodInfer<S>>) => Promise<unknown>)[];
};

export type FormStepElement<S extends Schema> = ReactElement<
  unknown,
  FormStepComponent<S>
>;

// export type OnMutation<Input, Output> = Pick<Parameters<typeof useMutation<Input, Error, Output>>[0], 'onSuccess' | 'onError' | 'onSettled'>;
