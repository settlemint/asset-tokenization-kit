import type {
  ControllerRenderProps,
  FieldValues,
  Path,
  RegisterOptions,
} from "react-hook-form";

export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const TEXT_ONLY_PATTERN = /^[A-Za-z]+$/;

/**
 * Handles number input changes with validation
 */
export function handleNumberInput<T extends FieldValues>(
  value: string,
  field: ControllerRenderProps<T, Path<T>>,
  props: { min?: number; max?: number },
  triggerValidation: () => Promise<void>
): void {
  if (value === "") {
    field.onChange("");
    void triggerValidation();
    return;
  }

  // Prevent negative numbers if not starting with minus already
  if (value.startsWith("-")) {
    return;
  }

  // Prevent leading zeros except for decimals
  if (value.startsWith("0") && value !== "0" && !value.startsWith("0.")) {
    return;
  }

  const numValue = parseFloat(value);
  if (!isNaN(numValue)) {
    // Check bounds
    if (typeof props.max === "number" && numValue > props.max) {
      return;
    }
    if (typeof props.min === "number" && numValue < props.min) {
      return;
    }
    field.onChange(numValue);
  } else {
    field.onChange(value);
  }
  void triggerValidation();
}

/**
 * Creates validation rules based on input type
 */
export function deriveValidationRules(
  type?: string,
  textOnly?: boolean,
  required?: boolean,
  t?: (key: string) => string
): Partial<RegisterOptions> {
  const rules: Partial<RegisterOptions> = {};

  if (type === "email" && t) {
    rules.pattern = {
      value: EMAIL_PATTERN,
      message: t("valid-email"),
    };
  }

  if (textOnly && t) {
    rules.pattern = {
      value: TEXT_ONLY_PATTERN,
      message: t("letters-only"),
    };
  }

  if (type === "number") {
    rules.valueAsNumber = true;
  }

  // Simple validation for optional fields
  rules.validate = (value: unknown): boolean => {
    if (!required && (value === "" || value === null || value === undefined)) {
      return true;
    }
    if (!required && typeof value === "string" && value.trim() === "") {
      return true;
    }
    return true;
  };

  return rules;
}
