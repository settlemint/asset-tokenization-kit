'use client';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import type { ComponentPropsWithoutRef } from 'react';
import type { FieldValues } from 'react-hook-form';
import {
  getAriaAttributes,
  type BaseFormInputProps,
  type WithHelperTextProps,
} from './types';

type SwitchProps = ComponentPropsWithoutRef<typeof Switch>;

type FormSwitchProps<T extends FieldValues> = Omit<
  SwitchProps,
  keyof BaseFormInputProps<T>
> &
  BaseFormInputProps<T> &
  WithHelperTextProps;

/**
 * A form switch component that wraps shadcn's Switch component with form field functionality.
 * Provides a toggle switch with optional helper text and full form integration.
 *
 * @example
 * ```tsx
 * <AssetFormSwitch
 *   name="notifications"
 *   control={form.control}
 *   label="Enable Notifications"
 *   helperText="Receive updates about your account"
 * />
 * ```
 */
export function FormSwitch<T extends FieldValues>({
  label,
  description,
  helperText,
  rules,
  className,
  ...props
}: FormSwitchProps<T>) {
  return (
    <FormField
      {...props}
      rules={rules}
      render={({ field, fieldState }) => {
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
              <div className="flex items-center space-x-2">
                <Switch
                  {...field}
                  {...props}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className={cn(className)}
                  {...ariaAttrs}
                />
                {helperText && (
                  <span
                    className="text-muted-foreground text-sm"
                    id={`${field.name}-helper`}
                  >
                    {helperText}
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
