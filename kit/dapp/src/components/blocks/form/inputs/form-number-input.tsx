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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils/number";
import BigNumber from "bignumber.js";
import { useLocale, useTranslations } from "next-intl";
import type { ChangeEvent, ComponentPropsWithoutRef } from "react";
import { useEffect, useState } from "react";
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

interface NumberInputContentProps<T extends FieldValues>
  extends Omit<InputProps, "disabled" | "description" | "label"> {
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
}
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
}: NumberInputContentProps<T>) {
  const t = useTranslations("components.form.input");
  const locale = useLocale();
  const [isFocused, setIsFocused] = useState(false);
  const [rawInput, setRawInput] = useState("");
  const debouncedRawInput = useDebounce(rawInput, 500);

  // Helper function to format decimal separator based on locale
  const formatDecimalSeparator = (value: string) => {
    const decimalSeparator = new Intl.NumberFormat(locale)
      .format(1.1)
      .charAt(1);
    return value.replace(".", decimalSeparator);
  };

  // Helper function to sanitize and validate the input
  const sanitizeAndValidate = (value: string) => {
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
        console.log("Rejecting zero value due to minNotZero constraint");
        // Calculate smallest possible value based on decimals
        const smallestValue = new BigNumber(1).div(
          new BigNumber(10).pow(decimals)
        );
        console.log(
          "Using smallest valid value instead:",
          smallestValue.toString()
        );
        field.onChange(smallestValue.toString());
        console.log("Triggering validation after fixing zero value");
        void formContext.trigger(field.name);
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

  // Effect to handle debounced formatting
  useEffect(() => {
    if (!isFocused && debouncedRawInput) {
      sanitizeAndValidate(debouncedRawInput);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedRawInput, isFocused]);

  // Store the actual numeric value for focusing
  const getActualValue = () => {
    if (field.value === undefined) return "";

    try {
      const bnValue = new BigNumber(field.value);
      if (bnValue.isNaN()) return "";
      return bnValue.toString();
    } catch {
      return "";
    }
  };

  // Convert the form value to a display string
  const displayValue = (() => {
    if (isFocused) return rawInput || getActualValue();
    if (field.value === undefined) return "";

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

  // Generate validation rules text for the tooltip
  const validationRules = (() => {
    const rules = [];

    // Calculate smallest possible value based on decimals
    const smallestValue = new BigNumber(1).div(new BigNumber(10).pow(decimals));

    // Add rules based on constraints
    if (minValue) {
      rules.push(
        t("min-value", {
          min: formatNumber(minValue.toString(), { locale, decimals }),
        })
      );
    } else if (minNotZero) {
      rules.push(
        t("min-value", {
          min: formatNumber(smallestValue.toString(), { locale, decimals }),
        })
      );
    }

    if (maxValue) {
      rules.push(
        t("max-value", {
          max: formatNumber(maxValue.toString(), {
            locale,
            decimals,
            stripZeroDecimals: true,
          }),
        })
      );
    }

    if (decimals < 18) {
      rules.push(t("max-decimals", { decimals }));
    }

    if (!allowNegative) {
      rules.push(t("non-negative"));
    }

    return rules;
  })();

  return (
    <FormItem className="flex flex-col space-y-1">
      {label && (
        <FormLabel
          className={cn(disabled && "cursor-not-allowed opacity-70")}
          htmlFor={field.name}
          id={`${field.name}-label`}
        >
          <span className="flex items-center gap-1">{label}</span>
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
          {validationRules.length > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Input
                    {...field}
                    {...props}
                    className={cn(
                      props.className,
                      postfix &&
                        "-mr-px rounded-r-none shadow-none focus:mr-[1px]",
                      "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    )}
                    type="text"
                    inputMode="decimal"
                    value={props.defaultValue ? undefined : displayValue}
                    onFocus={(e) => {
                      setIsFocused(true);
                      // When focusing, show the actual numeric value without formatting
                      const actualValue = getActualValue();
                      setRawInput(actualValue);
                      e.target.value = actualValue;
                    }}
                    onBlur={(e) => {
                      setIsFocused(false);
                      sanitizeAndValidate(e.target.value);
                      console.log(
                        "Triggering validation for",
                        field.name,
                        "value:",
                        field.value
                      );
                      const result = formContext.trigger(field.name);
                      result
                        .then((valid) => console.log("Trigger result:", valid))
                        .catch((err) => console.error("Trigger error:", err));
                    }}
                    onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                      const inputValue = evt.target.value;
                      setRawInput(inputValue);

                      // If minNotZero is true and value is a variant of zero, trigger validation immediately
                      if (
                        minNotZero &&
                        (inputValue === "0" || /^0[.,]0*$/.test(inputValue))
                      ) {
                        console.log(
                          "Rejecting zero value in onChange due to minNotZero constraint"
                        );
                        // Calculate smallest possible value based on decimals
                        const smallestValue = new BigNumber(1).div(
                          new BigNumber(10).pow(decimals)
                        );
                        console.log(
                          "Using smallest valid value instead:",
                          smallestValue.toString()
                        );
                        field.onChange(smallestValue.toString());
                        void formContext.trigger(field.name);
                      }
                    }}
                    {...getAriaAttributes(
                      field.name,
                      !!fieldState.error,
                      disabled
                    )}
                    disabled={disabled}
                  />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm" side="bottom">
                  <div className="text-sm">
                    <ul className="list-disc pl-4 space-y-1">
                      {validationRules.map((rule, index) => (
                        <li key={index}>{rule}</li>
                      ))}
                    </ul>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Input
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
                // When focusing, show the actual numeric value without formatting
                const actualValue = getActualValue();
                setRawInput(actualValue);
                e.target.value = actualValue;
              }}
              onBlur={(e) => {
                setIsFocused(false);
                sanitizeAndValidate(e.target.value);
                console.log(
                  "Triggering validation for",
                  field.name,
                  "value:",
                  field.value
                );
                const result = formContext.trigger(field.name);
                result
                  .then((valid) => console.log("Trigger result:", valid))
                  .catch((err) => console.error("Trigger error:", err));
              }}
              onChange={(evt: ChangeEvent<HTMLInputElement>) => {
                const inputValue = evt.target.value;
                setRawInput(inputValue);

                // If minNotZero is true and value is a variant of zero, trigger validation immediately
                if (
                  minNotZero &&
                  (inputValue === "0" || /^0[.,]0*$/.test(inputValue))
                ) {
                  console.log(
                    "Rejecting zero value in onChange due to minNotZero constraint"
                  );
                  // Calculate smallest possible value based on decimals
                  const smallestValue = new BigNumber(1).div(
                    new BigNumber(10).pow(decimals)
                  );
                  console.log(
                    "Using smallest valid value instead:",
                    smallestValue.toString()
                  );
                  field.onChange(smallestValue.toString());
                  void formContext.trigger(field.name);
                }
              }}
              {...getAriaAttributes(field.name, !!fieldState.error, disabled)}
              disabled={disabled}
            />
          )}
          {postfix && (
            <span
              className={cn(
                "flex items-center px-3 text-sm text-foreground border border-l-0 bg-muted/50 rounded-r-md"
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
  formatDisplay = true,
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
  // Use smallestValue as min when min is not provided but minNotZero is true
  const minValue =
    min !== undefined
      ? new BigNumber(min)
      : minNotZero
        ? smallestValue
        : undefined;
  const maxValue = max !== undefined ? new BigNumber(max) : undefined;

  return (
    <FormField
      {...props}
      rules={{
        required: props.required,
        pattern: {
          value: NUMBER_PATTERN,
          message: t("valid-number"),
        },
        validate: {
          validBigNumber: (value) => {
            console.log("validBigNumber validation running", value);
            try {
              const bnValue = new BigNumber(value);
              return !bnValue.isNaN() || t("valid-number");
            } catch {
              return t("valid-number");
            }
          },
          notZero: (value) => {
            console.log("notZero validation running", value, minNotZero);

            try {
              const bnValue = new BigNumber(value);
              if (bnValue.isZero()) {
                console.log("notZero validation failed: zero not allowed");
                return t("min-not-zero");
              }
              return true;
            } catch (err) {
              console.log("notZero validation error:", err);
              return true;
            }
          },
          nonNegative: (value) => {
            console.log("nonNegative validation running", value);
            if (value === undefined || allowNegative) return true;

            try {
              const bnValue = new BigNumber(value);
              return !bnValue.isNegative() || t("min-value", { min: "0" });
            } catch {
              return true;
            }
          },
          maxValue: (value) => {
            if (value === undefined || !maxValue) return true;

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
            console.log("minValue validation running", value, minValue);
            if (value === undefined || !minValue) {
              console.log("minValue validation skipped:", {
                value,
                minValue,
                reason: "value undefined or minValue not set",
              });
              return true;
            }

            try {
              const bnValue = new BigNumber(value ?? 0);
              console.log("minValue calculated bnValue:", bnValue.toString());

              // Check explicit minimum if set
              if (minValue && bnValue.lt(minValue)) {
                console.log(
                  "minValue validation failed: value less than minimum"
                );
                return t("min-value", {
                  min: formatNumber(minValue.toString(), { locale }),
                });
              }

              console.log("minValue validation passed");
              return true;
            } catch (err) {
              console.log("minValue validation error:", err);
              return true;
            }
          },
          decimalsCheck: (value) => {
            if (value === undefined || decimals === undefined) return true;

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
