'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';
import type { FieldValues, UseControllerProps } from 'react-hook-form';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

type InputProps = ComponentPropsWithoutRef<typeof Input>;

type AssetFormInputProps<T extends FieldValues> = Omit<InputProps, keyof UseControllerProps<T>> &
  UseControllerProps<T> & {
    label?: string;
    description?: string;
    postfix?: string;
  };

/**
 * A form input component that wraps shadcn's Input component with form field functionality.
 */
export function AssetFormInput<T extends FieldValues>({
  label,
  rules,
  description,
  postfix,
  ...props
}: AssetFormInputProps<T>) {
  return (
    <FormField
      {...props}
      rules={{
        ...rules,
        ...(props.type === 'email' && { pattern: EMAIL_PATTERN }),
      }}
      render={({ field, fieldState }) => {
        const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (props.type === 'number') {
            // Ensure we always pass a number or empty string, never undefined
            field.onChange(value === '' ? '' : Number(value));
          } else {
            // Ensure we always pass a string, never undefined
            field.onChange(value ?? '');
          }
        };

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
                {label}
              </FormLabel>
            )}
            <FormControl>
              <div className={cn('flex rounded-lg shadow-black/5 shadow-sm', !postfix && 'shadow-none')}>
                <Input
                  {...field}
                  {...props}
                  className={cn(props.className, postfix && '-me-px rounded-e-none shadow-none focus:mr-[1px]')}
                  type={props.type}
                  value={props.defaultValue ? undefined : (field.value ?? '')}
                  onChange={handleChange}
                  inputMode={props.type === 'number' ? 'decimal' : 'text'}
                  pattern={props.type === 'number' ? '[0-9]*.?[0-9]*' : undefined}
                  id={field.name}
                  aria-invalid={!!fieldState.error}
                  aria-describedby={`${field.name}-error ${field.name}-description ${field.name}-label`}
                  aria-disabled={props.disabled}
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
