import type { ComponentType, ReactElement } from 'react';
import type { Schema, z } from 'zod';

export type FormStepComponent<S extends Schema> = ComponentType & {
  validatedFields: readonly (keyof z.infer<S>)[];
};

export type FormStepElement<S extends Schema> = ReactElement<unknown, FormStepComponent<S>>;

// export type OnMutation<Input, Output> = Pick<Parameters<typeof useMutation<Input, Error, Output>>[0], 'onSuccess' | 'onError' | 'onSettled'>;
