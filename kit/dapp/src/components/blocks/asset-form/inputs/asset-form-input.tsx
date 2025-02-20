'use client';

import type {
  BaseFormInputProps,
  WithPostfixProps,
  WithTextOnlyProps,
} from '@/components/blocks/asset-form/asset-form-types';
import { getAriaAttributes } from '@/components/blocks/asset-form/asset-form-types';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';
import type { FieldValues } from 'react-hook-form';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const TEXT_ONLY_PATTERN = /^[A-Za-z]+$/;

type InputProps = ComponentPropsWithoutRef<typeof Input>;

type AssetFormInputProps<T extends FieldValues> = Omit<InputProps, keyof BaseFormInputProps<T>> &
  BaseFormInputProps<T> &
  WithPostfixProps &
  WithTextOnlyProps;

/**
 * A form input component that wraps shadcn's Input component with form field functionality.
 * Supports various input types including text, number, and email with built-in validation.
 *
 * @example
 * ```tsx
 * <AssetFormInput
 *   name="email"
 *   control={form.control}
 *   label="Email"
 *   type="email"
 *   required
 * />
 * ```
 */
export function AssetFormInput<T extends FieldValues>({
  label,
  rules,
  description,
  postfix,
  className,
  textOnly,
  ...props
}: AssetFormInputProps<T>) {
  return (
    <FormField
      {...props}
      rules={{
        ...rules,
        ...(props.type === 'email' && {
          pattern: { value: EMAIL_PATTERN, message: 'Please enter a valid email address' },
        }),
        ...(textOnly && {
          pattern: { value: TEXT_ONLY_PATTERN, message: 'Please enter letters only' },
        }),
      }}
      render={({ field, fieldState }) => {
        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (props.type === 'number') {
            // Ensure we always pass a number or empty string, never undefined
            field.onChange(value === '' ? 0 : Number(value));
          } else {
            // Ensure we always pass a string, never undefined
            field.onChange(value ?? '');
          }
        };

        const ariaAttrs = getAriaAttributes(field.name, !!fieldState.error, props.disabled);

        return (
          <FormItem>
            {label && (
              <FormLabel
                className={cn(
                  fieldState.error && 'text-destructive',
                  props.disabled && 'cursor-not-allowed opacity-70'
                )}
                htmlFor={field.name}
                id={`${field.name}-label`}
              >
                <span>{label}</span>
                {props.required && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className={cn('flex rounded-lg shadow-black/5 shadow-sm', !postfix && 'shadow-none')}>
                <Input
                  {...field}
                  {...props}
                  className={cn(className, postfix && '-me-px rounded-e-none shadow-none focus:mr-[1px]')}
                  type={props.type}
                  value={props.defaultValue ? undefined : (field.value ?? '')}
                  onChange={handleChange}
                  inputMode={props.type === 'number' ? 'decimal' : 'text'}
                  pattern={props.type === 'number' ? '[0-9]*.?[0-9]*' : undefined}
                  {...ariaAttrs}
                />
                {postfix && (
                  <span className="inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-muted-foreground text-sm">
                    {postfix}
                  </span>
                )}
              </div>
            </FormControl>
            {description && <FormDescription id={`${field.name}-description`}>{description}</FormDescription>}
            <FormMessage id={`${field.name}-error`} aria-live="polite" />
          </FormItem>
        );
      }}
    />
  );
}
