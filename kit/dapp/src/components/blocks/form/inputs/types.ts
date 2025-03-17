import type { FieldValues, UseControllerProps } from "react-hook-form";

/**
 * Base props for all form inputs
 */
export type BaseFormInputProps<T extends FieldValues> =
  UseControllerProps<T> & {
    /** The label text for the input */
    label?: string;
    /** Additional description text */
    description?: string;
    /** Whether the field is required */
    required?: boolean;
    /** Custom CSS classes */
    className?: string;
    /** Whether the input is disabled */
    disabled?: boolean;
  };

/**
 * Props for form inputs that support placeholders
 */
export type WithPlaceholderProps = {
  /** Placeholder text when no value is selected */
  placeholder?: string;
};

/**
 * Props for form inputs that support helper text
 */
export type WithHelperTextProps = {
  /** Additional helper text displayed next to the input */
  helperText?: string;
};

/**
 * Props for form inputs that support postfix text
 */
export type WithPostfixProps = {
  /** Text displayed after the input */
  postfix?: string;
};

export type WithTextOnlyProps = {
  /** Whether the input is text only */
  textOnly?: boolean;
};

/**
 * Error state for form inputs
 */
export type FormInputErrorState = {
  /** Whether the input has an error */
  hasError: boolean;
  /** The error message */
  errorMessage?: string;
};

/**
 * Utility function to generate ARIA attributes for form inputs
 */
export function getAriaAttributes(
  name: string,
  hasError: boolean,
  disabled?: boolean
) {
  return {
    "aria-invalid": hasError,
    "aria-describedby": `${name}-error ${name}-description ${name}-label`,
    "aria-disabled": disabled,
    id: name,
  };
}
