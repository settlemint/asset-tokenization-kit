"use client";

import { TranslatableFormFieldMessage } from "@/components/form/form-field-translatable-message";
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
import {
  type ChangeEvent,
  type ComponentPropsWithoutRef,
  useCallback,
} from "react";
import {
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldValues,
  type Path,
  useFormContext,
} from "react-hook-form";
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

  const onInputChange = useCallback(
    (field: ControllerRenderProps<T, Path<T>>, inputProps: InputProps) => {
      return async (evt: ChangeEvent<HTMLInputElement>) => {
        if (inputProps.type === "number") {
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
              typeof inputProps.max === "number" &&
              numValue > inputProps.max
            ) {
              return;
            }
            if (
              typeof inputProps.min === "number" &&
              numValue < inputProps.min
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
          if (!inputProps.required && evt.target.value === "") {
            form.clearErrors(field.name);
          } else if (form.formState.errors[field.name]) {
            await form.trigger(field.name);
          }
        }

        // Chain the external onChange handler if provided
        if (inputProps.onChange) {
          inputProps.onChange(evt);
        }
      };
    },
    [form]
  );

  const renderField = useCallback(
    ({
      field,
      fieldState,
    }: {
      field: ControllerRenderProps<T, Path<T>>;
      fieldState: ControllerFieldState;
    }) => {
      const inputProps = props;

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
                {inputProps.required && (
                  <span className="ml-1 text-destructive">*</span>
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
                  valueAsNumber: inputProps.type === "number",
                })}
                {...field}
                {...inputProps}
                className={cn(
                  className,
                  postfix && "-mr-px rounded-r-none shadow-none focus:mr-[1px]"
                )}
                type={inputProps.type}
                value={
                  inputProps.defaultValue ? undefined : (field.value ?? "")
                }
                onChange={onInputChange(field, inputProps)}
                inputMode={inputProps.type === "number" ? "decimal" : "text"}
                {...getAriaAttributes(field.name, !!fieldState.error, disabled)}
                disabled={disabled}
              />
              {postfix && (
                <span
                  className={cn(
                    "flex items-center bg-transparent text-sm text-foreground rounded-r-md px-3",
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
          <TranslatableFormFieldMessage />
        </FormItem>
      );
    },
    [
      className,
      description,
      disabled,
      label,
      onInputChange,
      postfix,
      props,
      register,
    ]
  );

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
        validate: (value) => {
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
      }}
      render={renderField}
    />
  );
}
