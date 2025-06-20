import type { FieldValues, FormState, Path } from "react-hook-form";

/**
 * Checks if any fields in a step have validation errors.
 * Only considers errors for fields that have been touched by the user.
 *
 * @param stepFields - Array of field names to check
 * @param formState - Current form state from useFormContext
 * @returns True if any touched fields have errors, false otherwise
 */
export function hasStepFieldErrors<TFieldValues extends FieldValues>(
  stepFields: readonly string[],
  formState: FormState<TFieldValues>
): boolean {
  const { touchedFields, errors } = formState;

  // Check if any touched fields have errors
  return stepFields.some((fieldName) => {
    // Convert to unknown path type for safe access
    const field = fieldName as unknown as Path<TFieldValues>;

    // Check if the field has been touched
    const isTouched = field in touchedFields;

    // Check if the field has an error
    const hasError = field in errors;

    return isTouched && hasError;
  });
}
