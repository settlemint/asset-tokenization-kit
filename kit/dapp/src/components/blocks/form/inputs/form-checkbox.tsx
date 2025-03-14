"use client";

import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";
import type { FieldValues } from "react-hook-form";
import { type BaseFormInputProps, getAriaAttributes } from "./types";

type CheckboxProps = ComponentPropsWithoutRef<typeof Checkbox>;

type FormCheckboxProps<T extends FieldValues> = Omit<
  CheckboxProps,
  keyof BaseFormInputProps<T>
> &
  BaseFormInputProps<T>;

/**
 * A form checkbox component that wraps shadcn's Checkbox component with form field functionality.
 *
 * @example
 * ```tsx
 * <AssetFormCheckbox
 *   name="agreeToTerms"
 *   control={form.control}
 *   label="I agree to the terms and conditions"
 *   required
 * />
 * ```
 */
export function FormCheckbox<T extends FieldValues>({
  label,
  rules,
  description,
  className,
  disabled,
  ...props
}: FormCheckboxProps<T>) {
  return (
    <FormField
      {...props}
      rules={rules}
      render={({ field, fieldState }) => {
        return (
          <FormItem className="flex flex-row items-start space-x-3 space-y-1 rounded-md">
            <FormControl>
              <Checkbox
                {...field}
                disabled={disabled}
                checked={field.value}
                onCheckedChange={field.onChange}
                className={cn(className)}
                {...getAriaAttributes(field.name, !!fieldState.error, disabled)}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              {label && (
                <FormLabel
                  className={cn(
                    "font-medium text-sm leading-none",
                    disabled && "cursor-not-allowed opacity-70"
                  )}
                  htmlFor={field.name}
                  id={`${field.name}-label`}
                >
                  <span>{label}</span>
                  {props.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </FormLabel>
              )}
              {description && (
                <FormDescription
                  id={`${field.name}-description`}
                  className="text-sm"
                >
                  {description}
                </FormDescription>
              )}
              <TranslatableFormFieldMessage
                id={`${field.name}-error`}
                aria-live="polite"
              />
            </div>
          </FormItem>
        );
      }}
    />
  );
}
