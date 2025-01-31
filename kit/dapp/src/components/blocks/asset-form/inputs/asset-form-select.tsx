'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { useRef } from 'react';
import type { FieldValues, UseControllerProps } from 'react-hook-form';

type Option = {
  label: string;
  value: string;
};

type AssetFormSelectProps<T extends FieldValues> = UseControllerProps<T> & {
  label?: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  options: Option[];
  className?: string;
  defaultValue?: string;
};

/**
 * A form select component that wraps shadcn's Select component with form field functionality.
 */
export function AssetFormSelect<T extends FieldValues>({
  label,
  description,
  required,
  placeholder = 'Select an option',
  options,
  className,
  defaultValue,
  ...props
}: AssetFormSelectProps<T>) {
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <FormField
      {...props}
      defaultValue={defaultValue}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel
              className={cn(fieldState.error && 'text-destructive', props.disabled && 'cursor-not-allowed opacity-70')}
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
          >
            <FormControl>
              <SelectTrigger
                ref={triggerRef}
                className={cn(props.disabled && 'cursor-not-allowed opacity-50')}
                id={field.name}
                aria-invalid={!!fieldState.error}
                aria-describedby={`${field.name}-error ${field.name}-description ${field.name}-label`}
                aria-disabled={props.disabled}
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
      )}
    />
  );
}
