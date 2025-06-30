"use client";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";
import { useCallback, useMemo } from "react";
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  useFormContext,
} from "react-hook-form";
import { type BaseFormInputProps, getAriaAttributes } from "./types";

type TextareaProps = ComponentPropsWithoutRef<typeof Textarea>;

type FormTextareaProps<T extends FieldValues> = Omit<
  TextareaProps,
  keyof BaseFormInputProps<T>
> &
  BaseFormInputProps<T>;

export function FormTextarea<T extends FieldValues>({
  label,
  rules,
  description,
  className,
  disabled,
  ...props
}: FormTextareaProps<T>) {
  const form = useFormContext<T>();
  const { register } = form;

  const validateFunction = useCallback(
    (value: unknown) => {
      if (!props.required) {
        if (value === "" || value === null || value === undefined) {
          return true;
        }
        if (typeof value === "string" && value.trim() === "") {
          return true;
        }
      }
      return true;
    },
    [props.required]
  );

  const rulesWithValidation = useMemo(
    () => ({
      ...rules,
      validate: validateFunction,
    }),
    [rules, validateFunction]
  );

  const renderField = useCallback(
    ({
      field,
      fieldState,
    }: {
      field: ControllerRenderProps<T, Path<T>>;
      fieldState: ControllerFieldState;
    }) => {
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
                  <span className="ml-1 text-destructive">*</span>
                )}
              </span>
            </FormLabel>
          )}
          <FormControl>
            <Textarea
              {...register(field.name)}
              {...field}
              {...props}
              className={cn("align-text-top", className)}
              value={props.defaultValue ? undefined : (field.value ?? "")}
              {...getAriaAttributes(field.name, !!fieldState.error, disabled)}
              disabled={disabled}
            />
          </FormControl>
          {description && (
            <FormDescription id={`${field.name}-description`}>
              {description}
            </FormDescription>
          )}
        </FormItem>
      );
    },
    [label, disabled, props, register, className, description]
  );

  return (
    <FormField {...props} rules={rulesWithValidation} render={renderField} />
  );
}
