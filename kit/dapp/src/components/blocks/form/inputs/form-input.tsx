'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import type { ChangeEvent, ComponentPropsWithoutRef } from 'react';
import type { FieldValues } from 'react-hook-form';
import { useFormContext } from 'react-hook-form';
import {
  getAriaAttributes,
  type BaseFormInputProps,
  type WithPostfixProps,
  type WithTextOnlyProps,
} from './types';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const TEXT_ONLY_PATTERN = /^[A-Za-z]+$/;

type InputProps = ComponentPropsWithoutRef<typeof Input>;

type FormInputProps<T extends FieldValues> = Omit<
  InputProps,
  keyof BaseFormInputProps<T>
> &
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
export function FormInput<T extends FieldValues>({
  label,
  rules,
  description,
  postfix,
  className,
  textOnly,
  ...props
}: FormInputProps<T>) {
  const form = useFormContext<T>();
  const t = useTranslations('components.form.input');

  return (
    <FormField
      {...props}
      rules={{
        ...rules,
        ...(props.type === 'email' && {
          pattern: {
            value: EMAIL_PATTERN,
            message: t('valid-email'),
          },
        }),
        ...(textOnly && {
          pattern: {
            value: TEXT_ONLY_PATTERN,
            message: t('letters-only'),
          },
        }),
      }}
      render={({ field, fieldState }) => {
        const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (props.type === 'number') {
            // Ensure we always pass a number or empty string, never undefined
            field.onChange(value === '' ? 0 : Number(value));
          } else {
            // Ensure we always pass a string, never undefined
            field.onChange(value ?? '');
          }
          // Trigger validation immediately after value change
          await form.trigger(field.name);
        };

        // Wrapper function that doesn't return the Promise
        const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
          void handleChange(e);
        };

        const ariaAttrs = getAriaAttributes(
          field.name,
          !!fieldState.error,
          props.disabled
        );

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
              <div
                className={cn(
                  'flex rounded-lg shadow-black/5 shadow-xs',
                  !postfix && 'shadow-none'
                )}
              >
                <Input
                  {...field}
                  {...props}
                  className={cn(
                    className,
                    postfix &&
                      '-me-px rounded-e-none shadow-none focus:mr-[1px]'
                  )}
                  type={props.type}
                  value={props.defaultValue ? undefined : (field.value ?? '')}
                  onChange={handleInputChange}
                  inputMode={props.type === 'number' ? 'decimal' : 'text'}
                  pattern={
                    props.type === 'number' ? '[0-9]*.?[0-9]*' : undefined
                  }
                  {...ariaAttrs}
                />
                {postfix && (
                  <span className="inline-flex items-center rounded-e-lg border border-input bg-background px-3 text-muted-foreground text-sm">
                    {postfix}
                  </span>
                )}
              </div>
            </FormControl>
            {description && (
              <FormDescription id={`${field.name}-description`}>
                {description}
              </FormDescription>
            )}
            <FormMessage id={`${field.name}-error`} aria-live="polite" />
          </FormItem>
        );
      }}
    />
  );
}
