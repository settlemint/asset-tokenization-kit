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
import { formatNumber } from "@/lib/utils/number";
import BigNumber from "bignumber.js";
import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent, ComponentPropsWithoutRef } from "react";
import { useState } from "react";
import {
  type ControllerRenderProps,
  type FieldError,
  type FieldValues,
  useFormContext,
} from "react-hook-form";
import {
  type BaseFormInputProps,
  type BigNumberInputProps,
  type WithPostfixProps,
  getAriaAttributes,
} from "./types";

type InputProps = ComponentPropsWithoutRef<typeof Input>;

type FormNumberInputProps<T extends FieldValues> = Omit<
  InputProps,
  keyof BaseFormInputProps<T> | keyof BigNumberInputProps | "type"
> &
  BaseFormInputProps<T> &
  BigNumberInputProps &
  WithPostfixProps & {
    /** Enforce non-zero values (zero is not allowed) */
    minNotZero?: boolean;
    /** Allow negative values (by default only non-negative values are allowed) */
    allowNegative?: boolean;
    placeholder?: string;
  };

// Allow just numbers, an optional single decimal separator, and optional minus at the start
const NUMBER_PATTERN = /^-?[0-9]*[.,]?[0-9]*$/;

/**
 * Internal component to render the number input field content
 */
function NumberInputContent<T extends FieldValues>({
  field,
  fieldState,
  formContext,
  minValue,
  maxValue,
  step,
  decimals,
  formatDisplay,
  postfix,
  disabled,
  description,
  label,
  minNotZero,
  allowNegative,
  placeholder,
  ...props
}: {
  field: ControllerRenderProps<T>;
  fieldState: { error?: FieldError };
  formContext: ReturnType<typeof useFormContext<T>>;
  minValue?: BigNumber;
  maxValue?: BigNumber;
  step: string;
  decimals: number;
  formatDisplay: boolean;
  postfix?: React.ReactNode;
  disabled?: boolean;
  description?: React.ReactNode;
  label?: string;
  minNotZero?: boolean;
  allowNegative?: boolean;
  placeholder?: string;
} & Omit<InputProps, "disabled" | "description" | "label">) {
  const t = useTranslations("components.form.input");
  const locale = useLocale();
  const [isFocused, setIsFocused] = useState(false);
  const [rawInput, setRawInput] = useState("");

  // Helper function to normalize decimal separator to period for BigNumber
  const normalizeDecimalSeparator = (value: string) => {
    return value.replace(",", ".");
  };

  // Helper function to format decimal separator based on locale
  const formatDecimalSeparator = (value: string) => {
    const decimalSeparator = new Intl.NumberFormat(locale)
      .format(1.1)
      .charAt(1);
    return value.replace(".", decimalSeparator);
  };

  // Helper function to sanitize and validate the input
  const sanitizeAndValidate = (value: string) => {
    if (value === "") {
      field.onChange("");
      return;
    }

    try {
      // Remove any non-numeric characters except . and -
      const sanitized = value
        .replace(/[^\d.,\-]/g, "") // Remove anything that's not a digit, dot, comma or minus
        .replace(/^(-)?/, "$1") // Keep only first minus sign if any
        .replace(/[.,]/g, ".") // Convert all decimal separators to dots
        .replace(/(\..*)\./g, "$1"); // Keep only first decimal point

      const bnValue = new BigNumber(sanitized);

      // Don't update if it's not a valid number
      if (bnValue.isNaN()) {
        return;
      }

      // If minNotZero is true, don't allow zero values
      if (minNotZero && bnValue.isZero()) {
        return;
      }

      // Don't allow negative values unless explicitly allowed
      if (!allowNegative && bnValue.isNegative()) {
        return;
      }

      // Validate against min/max constraints
      if (maxValue && bnValue.gt(maxValue)) {
        return;
      }

      if (minValue && bnValue.lt(minValue)) {
        return;
      }

      // Calculate smallest possible value based on decimals
      const smallestValue = new BigNumber(1).div(
        new BigNumber(10).pow(decimals)
      );

      // If minNotZero is true, ensure it's at least the smallest possible value
      if (minNotZero && bnValue.lt(smallestValue)) {
        return;
      }

      // Validate decimal places
      if (decimals !== undefined) {
        const decimalPart = sanitized.split(".")[1] || "";
        if (decimalPart.length > decimals) {
          const truncated = bnValue.toFixed(decimals, BigNumber.ROUND_DOWN);
          field.onChange(truncated);
          return;
        }
      }

      field.onChange(sanitized);
    } catch {
      // If BigNumber creation fails, don't update
      return;
    }
  };

  // Convert the form value to a display string
  const displayValue = (() => {
    if (isFocused) return rawInput;
    if (field.value === "" || field.value === undefined) return "";

    try {
      const bnValue = new BigNumber(field.value);
      if (bnValue.isNaN()) return "";

      // Format the value when not focused
      if (formatDisplay) {
        const formattedValue = bnValue.toFormat();
        if (formattedValue.includes(".")) {
          const parts = formattedValue.split(".");
          const value = `${parts[0]}.${parts[1].substring(0, Math.min(parts[1].length, decimals))}`;
          return formatDecimalSeparator(value);
        }
        return formattedValue;
      }

      return formatDecimalSeparator(bnValue.toString());
    } catch {
      return field.value;
    }
  })();

  // Generate dynamic placeholder if none is provided
  const dynamicPlaceholder = (() => {
    if (placeholder) return placeholder;

    // Calculate smallest possible value based on decimals
    const smallestValue = new BigNumber(1).div(new BigNumber(10).pow(decimals));

    // Determine which constraints are active
    const hasMin = !!minValue;
    const hasMax = !!maxValue;
    const hasMinNotZero = !!minNotZero;
    const hasDecimalLimit = decimals < 18;

    // Use the most specific placeholder translation based on active constraints
    if (hasMin && hasMax && hasMinNotZero && hasDecimalLimit) {
      return t("placeholder.all-constraints", {
        min: formatNumber(minValue!.toString(), { locale }),
        max: formatNumber(maxValue!.toString(), { locale }),
        smallestValue: formatNumber(smallestValue.toString(), { locale }),
        decimals,
      });
    } else if (hasMax && hasMinNotZero && hasDecimalLimit) {
      return t("placeholder.max-not-zero-decimals", {
        max: formatNumber(maxValue!.toString(), { locale }),
        smallestValue: formatNumber(smallestValue.toString(), { locale }),
        decimals,
      });
    } else if (hasMin && hasMax && hasDecimalLimit) {
      return t("placeholder.min-max-decimals", {
        min: formatNumber(minValue!.toString(), { locale }),
        max: formatNumber(maxValue!.toString(), { locale }),
        decimals,
      });
    } else if (hasMin && hasMax) {
      return t("placeholder.min-max", {
        min: formatNumber(minValue!.toString(), { locale }),
        max: formatNumber(maxValue!.toString(), { locale }),
      });
    } else if (hasMin && hasMinNotZero) {
      return t("placeholder.min-not-zero", {
        min: formatNumber(minValue!.toString(), { locale }),
      });
    } else if (hasMin) {
      return t("placeholder.min", {
        min: formatNumber(minValue!.toString(), { locale }),
      });
    } else if (hasMax) {
      return t("placeholder.max", {
        max: formatNumber(maxValue!.toString(), { locale }),
      });
    } else if (hasMinNotZero) {
      return t("placeholder.min-not-zero-only", {
        smallestValue: formatNumber(smallestValue.toString(), { locale }),
      });
    } else if (hasDecimalLimit) {
      return t("placeholder.decimals-only", {
        decimals,
      });
    }

    return undefined;
  })();

  return (
    <FormItem className="flex flex-col space-y-1">
      {label && (
        <FormLabel
          className={cn(disabled && "cursor-not-allowed opacity-70")}
          htmlFor={field.name}
          id={`${field.name}-label`}
        >
          <span>{label}</span>
          {props.required && <span className="ml-1 text-destructive">*</span>}
        </FormLabel>
      )}
      <FormControl>
        <div
          className={cn(
            "relative flex rounded-lg shadow-black/5 shadow-xs",
            !postfix && "shadow-none"
          )}
        >
          <Input
            {...formContext.register(field.name)}
            {...field}
            {...props}
            className={cn(
              props.className,
              postfix && "-mr-px rounded-r-none shadow-none focus:mr-[1px]",
              "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            )}
            type="text"
            inputMode="decimal"
            value={props.defaultValue ? undefined : displayValue}
            onFocus={(e) => {
              setIsFocused(true);
              setRawInput(e.target.value);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              sanitizeAndValidate(e.target.value);
              void formContext.trigger(field.name);
            }}
            onChange={(evt: ChangeEvent<HTMLInputElement>) => {
              const inputValue = evt.target.value;
              setRawInput(inputValue);

              // During typing, we only update the form value if it's empty
              if (inputValue === "") {
                field.onChange("");
              }
            }}
            {...getAriaAttributes(field.name, !!fieldState.error, disabled)}
            disabled={disabled}
            placeholder={dynamicPlaceholder}
          />
          {postfix && (
            <span
              className={cn(
                "flex items-center px-3 text-sm text-muted-foreground border border-l-0 bg-muted/50 rounded-r-md"
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
      <TranslatableFormFieldMessage
        id={`${field.name}-error`}
        aria-live="polite"
      />
    </FormItem>
  );
}

/**
 * A specialized form input component for numbers with built-in validation and formatting.
 * Uses BigNumber.js for precise decimal handling and supports large numbers.
 *
 * @example
 * ```tsx
 * <FormNumberInput
 *   name="amount"
 *   label="Amount"
 *   min={0}
 *   max={100}
 *   decimals={2}
 *   required
 * />
 * ```
 */
export function FormNumberInput<T extends FieldValues>({
  label,
  rules,
  description,
  postfix,
  className,
  disabled,
  min,
  max,
  step = "1",
  decimals = 18, // Default to maximum precision for Ethereum
  formatDisplay = false,
  minNotZero,
  allowNegative,
  placeholder,
  ...props
}: FormNumberInputProps<T>) {
  const form = useFormContext<T>();
  const t = useTranslations("components.form.input");
  const locale = useLocale();

  // Calculate the smallest possible value based on decimals (e.g., 0.01 for 2 decimals)
  const smallestValue = new BigNumber(1).div(new BigNumber(10).pow(decimals));

  // Convert min/max to BigNumber for comparisons
  const minValue = min !== undefined ? new BigNumber(min) : undefined;
  const maxValue = max !== undefined ? new BigNumber(max) : undefined;

  return (
    <FormField
      {...props}
      rules={{
        ...rules,
        pattern: {
          value: NUMBER_PATTERN,
          message: t("valid-number"),
        },
        validate: {
          validBigNumber: (value) => {
            if (value === "" || value === undefined) return true;

            try {
              const bnValue = new BigNumber(value);
              return !bnValue.isNaN() || t("valid-number");
            } catch {
              return t("valid-number");
            }
          },
          nonNegative: (value) => {
            if (value === "" || value === undefined || allowNegative)
              return true;

            try {
              const bnValue = new BigNumber(value);
              return !bnValue.isNegative() || t("min-value", { min: "0" });
            } catch {
              return true;
            }
          },
          maxValue: (value) => {
            if (value === "" || value === undefined || !maxValue) return true;

            try {
              const bnValue = new BigNumber(value);
              return (
                bnValue.lte(maxValue) ||
                t("max-value", {
                  max: formatNumber(maxValue.toString(), { locale }),
                })
              );
            } catch {
              return true;
            }
          },
          minValue: (value) => {
            if (value === "" || value === undefined) return true;

            try {
              const bnValue = new BigNumber(value);

              // Check if zero is not allowed
              if (minNotZero && bnValue.isZero()) {
                return "Value cannot be zero";
              }

              // Check explicit minimum if set
              if (minValue && bnValue.lt(minValue)) {
                return t("min-value", {
                  min: formatNumber(minValue.toString(), { locale }),
                });
              }

              // Check minimum for non-zero values
              if (minNotZero && bnValue.lt(smallestValue)) {
                return `Value must be at least ${formatNumber(smallestValue.toString(), { locale })}`;
              }

              return true;
            } catch {
              return true;
            }
          },
          decimalsCheck: (value) => {
            if (value === "" || value === undefined || decimals === undefined)
              return true;

            try {
              const bnValue = new BigNumber(value);
              const decimalPart = bnValue.toString().split(".")[1] || "";
              return (
                decimalPart.length <= decimals ||
                t("max-decimals", { decimals: decimals })
              );
            } catch {
              return true;
            }
          },
        },
      }}
      render={({ field, fieldState }) => (
        <NumberInputContent
          field={field}
          fieldState={fieldState}
          formContext={form}
          minValue={minValue}
          maxValue={maxValue}
          step={step as string}
          decimals={decimals}
          formatDisplay={formatDisplay}
          postfix={postfix}
          disabled={disabled}
          description={description}
          label={label}
          minNotZero={minNotZero}
          allowNegative={allowNegative}
          placeholder={placeholder}
          {...props}
          className={className}
        />
      )}
    />
  );
}
