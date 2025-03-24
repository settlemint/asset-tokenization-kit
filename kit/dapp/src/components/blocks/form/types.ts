import type { Infer, Schema } from "next-safe-action/adapters/types";
import type { ComponentType, ReactElement } from "react";
import type { UseFormReturn } from "react-hook-form";

export type ValidatedFields<S extends Schema> = {
  validatedFields: readonly (keyof Infer<S>)[];
};

export type FormStepComponent<S extends Schema> = ComponentType & {
  validatedFields: readonly (keyof Infer<S>)[];
  beforeValidate?: ((form: UseFormReturn<Infer<S>>) => Promise<unknown>)[];
};

export type FormStepElement<S extends Schema> = ReactElement<
  unknown,
  FormStepComponent<S>
>;

// export type OnMutation<Input, Output> = Pick<Parameters<typeof useMutation<Input, Error, Output>>[0], 'onSuccess' | 'onError' | 'onSettled'>;
