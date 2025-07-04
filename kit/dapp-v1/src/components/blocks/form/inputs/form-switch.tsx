"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";
import type { FieldValues } from "react-hook-form";
import { TranslatableFormFieldMessage } from "../form-field-translatable-message";
import {
  type BaseFormInputProps,
  type WithHelperTextProps,
  getAriaAttributes,
} from "./types";

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
  disabled,
  ...props
}: FormSwitchProps<T>) {
  return (
    <FormField
      {...props}
      rules={rules}
      render={({ field, fieldState }) => {
        return (
          <FormItem className="flex flex-col space-y-1">
            {label && (
              <FormLabel
                className={cn(disabled && "cursor-not-allowed opacity-70")}
                htmlFor={field.name}
                id={`${field.name}-label`}
              >
                <span>{label}</span>
                {props.required && (
                  <span className="ml-1 text-destructive">*</span>
                )}
              </FormLabel>
            )}
            <FormControl>
              <div className="flex items-center space-x-2">
                <Switch
                  {...field}
                  {...props}
                  disabled={disabled}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className={cn("w-9", className)}
                  {...getAriaAttributes(
                    field.name,
                    !!fieldState.error,
                    disabled
                  )}
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
            <TranslatableFormFieldMessage />
          </FormItem>
        );
      }}
    />
  );
}
