'use client';

import type { BaseFormInputProps, WithPlaceholderProps } from '@/components/blocks/asset-form/asset-form-types';
import { getAriaAttributes } from '@/components/blocks/asset-form/asset-form-types';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import type { FieldValues } from 'react-hook-form';

type Option = {
  /** The display text for the option */
  label: string;
  /** The value of the option */
  value: string;
};

type FormSelectProps<T extends FieldValues> = BaseFormInputProps<T> &
  WithPlaceholderProps & {
    /** The list of options to display in the select */
    options: Option[];
    /** The default selected value */
    defaultValue?: string;
  };

/**
 * A form select component that wraps shadcn's Select component with form field functionality.
 * Provides a dropdown selection with support for default values and custom options.
 *
 * @example
 * ```tsx
 * <AssetFormSelect
 *   name="category"
 *   control={form.control}
 *   label="Category"
 *   options={[
 *     { label: 'Option 1', value: '1' },
 *     { label: 'Option 2', value: '2' },
 *   ]}
 *   required
 * />
 * ```
 */
export function FormSelect<T extends FieldValues>({
  label,
  description,
  required,
  placeholder = 'Select an option',
  options,
  className,
  defaultValue,
  ...props
}: FormSelectProps<T>) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <FormField
      {...props}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => {
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
                {required && <span className="ml-1 text-red-500">*</span>}
              </FormLabel>
            )}
            <Select
              onValueChange={field.onChange}
              defaultValue={defaultValue}
              value={field.value ?? defaultValue}
              disabled={props.disabled}
              name={field.name}
            >
              <FormControl>
                <SelectTrigger
                  ref={triggerRef}
                  className={cn(props.disabled && 'cursor-not-allowed opacity-50', className)}
                  {...ariaAttrs}
                >
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {description && <FormDescription id={`${field.name}-description`}>{description}</FormDescription>}
            <FormMessage id={`${field.name}-error`} aria-live="polite" />
          </FormItem>
        );
      }}
    />
  );
}
