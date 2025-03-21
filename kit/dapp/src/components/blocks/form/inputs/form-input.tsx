"use client";

import { TranslatableFormFieldMessage } from "@/components/blocks/form/form-field-translatable-message";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { ChangeEvent, ComponentPropsWithoutRef } from "react";
import { type FieldValues, useFormContext } from "react-hook-form";
import {
  type BaseFormInputProps,
  type WithPostfixProps,
  type WithTextOnlyProps,
  getAriaAttributes,
} from "./types";
const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const TEXT_ONLY_PATTERN = /^[A-Za-z]+$/;

type InputProps = ComponentPropsWithoutRef<typeof Input>;

type FormInputProps<T extends FieldValues> = Omit<
  InputProps,
  keyof BaseFormInputProps<T> | "type" | "min" | "max" | "step"
> &
  BaseFormInputProps<T> &
  WithPostfixProps &
  WithTextOnlyProps & {
    /** Input type - supports text, email, password, etc. (not number) */
    type?: Exclude<React.HTMLInputTypeAttribute, "number">;
  };

/**
 * A form input component that wraps shadcn's Input component with form field functionality.
 * Supports various input types including text and email with built-in validation.
 * For number inputs, use FormNumberInput instead.
 *
 * @example
 * ```tsx
 * <FormInput
 *   name="email"
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
  disabled,
  type = "text",
  ...props
}: FormInputProps<T>) {
  const form = useFormContext<T>();
  const { register } = form;
  const t = useTranslations("components.form.input");

  if (type === "number") {
    console.warn(
      "FormInput does not support type 'number'. Use FormNumberInput instead."
    );
  }

  return (
    <FormField
      {...props}
      rules={{
        ...rules,
        ...(type === "email" && {
          pattern: {
            value: EMAIL_PATTERN,
            message: t("valid-email"),
          },
        }),
        ...(textOnly && {
          pattern: {
            value: TEXT_ONLY_PATTERN,
            message: t("letters-only"),
          },
        }),
      }}
      render={({ field, fieldState }) => {
        return (
          <FormItem className="flex flex-col space-y-1">
            {label && (
              <FormLabel
                className={cn(disabled && "cursor-not-allowed opacity-70")}
                htmlFor={field.name}
                id={`${field.name}-label`}
              >
                <span>
                  {label}
                  {props.required && (
                    <span className="text-destructive">*</span>
                  )}
                </span>
              </FormLabel>
            )}
            <FormControl>
              <div
                className={cn(
                  "flex rounded-lg shadow-black/5 shadow-xs",
                  !postfix && "shadow-none"
                )}
              >
                <Input
                  {...register(field.name)}
                  {...field}
                  {...props}
                  className={cn(
                    className,
                    postfix &&
                      "-mr-px rounded-r-none shadow-none focus:mr-[1px]"
                  )}
                  type={type}
                  value={props.defaultValue ? undefined : (field.value ?? "")}
                  onChange={async (evt: ChangeEvent<HTMLInputElement>) => {
                    field.onChange(evt);
                    if (form.formState.errors[field.name]) {
                      await form.trigger(field.name);
                    }
                  }}
                  inputMode={type === "email" ? "email" : "text"}
                  {...getAriaAttributes(
                    field.name,
                    !!fieldState.error,
                    disabled
                  )}
                  disabled={disabled}
                />
                {postfix && (
                  <span className="flex items-center px-3 text-sm text-muted-foreground border border-l-0 rounded-r-md bg-muted/50">
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
            <TranslatableFormFieldMessage
              id={`${field.name}-error`}
              aria-live="polite"
            />
          </FormItem>
        );
      }}
    />
  );
}
