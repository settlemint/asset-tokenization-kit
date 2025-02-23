import { zodResolver } from '@hookform/resolvers/zod';
import { type UseFormProps, useForm as useFormHook } from 'react-hook-form';
import type { Schema, z } from 'zod';

export function useForm<InputSchema extends Schema>(
  options: Omit<UseFormProps<z.infer<InputSchema>>, 'resolver'> & {
    inputSchema: InputSchema;
  }
) {
  const { inputSchema, ...rest } = options;

  return useFormHook<z.infer<InputSchema>>({
    resolver: zodResolver(inputSchema),
    mode: 'onSubmit',
    criteriaMode: 'all',
    shouldFocusError: false,
    shouldUseNativeValidation: true,
    ...rest,
  });
}
