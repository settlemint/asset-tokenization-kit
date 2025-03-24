"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
  disabled,
  ...props
}: FormInputProps<T>) {
  const form = useFormContext<T>();
  const { register } = form;
  const t = useTranslations("components.form.input");

  return (
    <FormField
      {...props}
      rules={{
        ...rules,
        ...(props.type === "email" && {
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
        ...(props.type === "number" && {
          valueAsNumber: true,
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
                  {...register(field.name, {
                    valueAsNumber: props.type === "number",
                  })}
                  {...field}
                  {...props}
                  className={cn(
                    className,
                    postfix &&
                      "-mr-px rounded-r-none shadow-none focus:mr-[1px]"
                  )}
                  type={props.type}
                  value={props.defaultValue ? undefined : (field.value ?? "")}
                  onChange={async (evt: ChangeEvent<HTMLInputElement>) => {
                    if (props.type === "number") {
                      const value = evt.target.value;

                      if (value === "") {
                        field.onChange(evt);
                        await form.trigger(field.name);
                        return;
                      }

                      if (value.startsWith("-")) {
                        return;
                      }

                      if (
                        value.startsWith("0") &&
                        value !== "0" &&
                        !value.startsWith("0.")
                      ) {
                        return;
                      }

                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        if (
                          typeof props.max === "number" &&
                          numValue > props.max
                        ) {
                          return;
                        }
                        if (
                          typeof props.min === "number" &&
                          numValue < props.min
                        ) {
                          return;
                        }
                        field.onChange(numValue);
                      } else {
                        field.onChange(value);
                      }
                      await form.trigger(field.name);
                    } else {
                      field.onChange(evt);
                      if (form.formState.errors[field.name]) {
                        await form.trigger(field.name);
                      }
                    }
                  }}
                  inputMode={props.type === "number" ? "decimal" : "text"}
                  {...getAriaAttributes(
                    field.name,
                    !!fieldState.error,
                    disabled
                  )}
                  disabled={disabled}
                />
                {postfix && (
                  <span
                    className={cn(
                      "flex items-center px-3 text-sm text-foreground border border-l-0 rounded-r-md",
                      fieldState.error
                        ? "border-destructive bg-destructive/10"
                        : "bg-muted/50"
                    )}
                  >
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
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
