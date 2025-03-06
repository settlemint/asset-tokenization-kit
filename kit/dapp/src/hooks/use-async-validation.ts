import { debounce } from "perfect-debounce";
import { useCallback, useEffect, useState } from "react";
import { type FieldValues, type Path, useFormContext } from "react-hook-form";

interface AsyncValidationOptions<T extends FieldValues> {
  // The field to validate
  field: Path<T>;
  // Async validation function that returns true if valid, false if invalid
  validate: (value: any, formData: T) => Promise<boolean>;
  // Optional debounce time in ms
  debounceMs?: number;
  // Optional fields that should trigger revalidation
  dependencies?: Path<T>[];
  // Callbacks for different states
  onValidate?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAsyncValidation<T extends FieldValues>({
  field,
  validate,
  debounceMs = 300,
  dependencies = [],
  onValidate,
  onSuccess,
  onError,
}: AsyncValidationOptions<T>) {
  const form = useFormContext<T>();
  const [isValidating, setIsValidating] = useState(false);

  // Create debounced validation function
  const debouncedValidate = useCallback(
    debounce(async (value: any) => {
      const isValid = await validate(value, form.getValues());
      return isValid;
    }, debounceMs),
    [validate, form]
  );

  // Watch for changes in the field and its dependencies
  useEffect(() => {
    const subscription = form.watch((formData, { name: fieldChanged }) => {
      if (
        fieldChanged &&
        (fieldChanged === field ||
          dependencies.includes(fieldChanged as Path<T>))
      ) {
        const value = formData[fieldChanged as keyof typeof formData];

        setIsValidating(true);
        onValidate?.();

        debouncedValidate(value)
          .then((isValid) => {
            if (isValid) {
              onSuccess?.();
            } else {
              onError?.(new Error("Validation failed"));
            }
          })
          .catch((error) => {
            onError?.(
              error instanceof Error ? error : new Error("Unknown error")
            );
          })
          .finally(() => {
            setIsValidating(false);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, [
    field,
    dependencies,
    debouncedValidate,
    form,
    onValidate,
    onSuccess,
    onError,
  ]);

  // Return validation state
  const fieldState = form.getFieldState(field);
  return {
    isValidating,
    error: fieldState.error,
  };
}
