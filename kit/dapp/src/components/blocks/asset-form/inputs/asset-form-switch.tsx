'use client';

import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';
import type { FieldValues, UseControllerProps } from 'react-hook-form';

type SwitchProps = ComponentPropsWithoutRef<typeof Switch>;

type AssetFormSwitchProps<T extends FieldValues> = Omit<SwitchProps, keyof UseControllerProps<T>> &
  UseControllerProps<T> & {
    label?: string;
    description?: string;
    helperText?: string;
  };

/**
 * A form switch component that wraps shadcn's Switch component with form field functionality.
 */
export function AssetFormSwitch<T extends FieldValues>({
  label,
  description,
  helperText,
  rules,
  ...props
}: AssetFormSwitchProps<T>) {
  return (
    <FormField
      {...props}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel
              className={cn(fieldState.error && 'text-destructive', props.disabled && 'cursor-not-allowed opacity-70')}
              htmlFor={field.name}
              id={`${field.name}-label`}
            >
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="flex items-center space-x-2">
              <Switch
                {...field}
                {...props}
                id={field.name}
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={!!fieldState.error}
                aria-describedby={`${field.name}-error ${field.name}-description ${field.name}-label`}
                aria-disabled={props.disabled}
              />
              {helperText && <span className="text-muted-foreground text-sm">{helperText}</span>}
            </div>
          </FormControl>
          {description && <FormDescription id={`${field.name}-description`}>{description}</FormDescription>}
          <FormMessage id={`${field.name}-error`} aria-live="polite" />
        </FormItem>
      )}
    />
  );
}
