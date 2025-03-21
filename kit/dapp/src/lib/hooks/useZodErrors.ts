/**
 * React hook for handling Zod validation errors in forms
 */
import { useTranslations } from "next-intl";
import { useCallback } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { flattenZodErrors, translateZodError } from "../utils/zod-translations";

// Type definition for the next-intl translation function
type TranslateFunction = (
  key: string,
  params?: Record<string, string | number>
) => string;

/**
 * Custom hook for handling Zod validation errors in forms
 *
 * This hook provides utility functions to translate Zod validation errors
 * with proper interpolation of dynamic values like minimums and maximums.
 *
 * @example
 * ```tsx
 * const form = useForm<FormData>({ resolver: zodResolver(schema) });
 * const { getZodError } = useZodErrors<FormData>();
 *
 * return (
 *   <form>
 *     <input {...form.register("email")} />
 *     {getZodError(form, "email")}
 *   </form>
 * );
 * ```
 */
export function useZodErrors<TFieldValues extends FieldValues = FieldValues>() {
  // Get translation function from next-intl and adapt it to our expected signature
  const t = useTranslations("zod.error");

  // Create a wrapper function with the signature we need
  const translate: TranslateFunction = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      // Check if the key already has a namespace
      if (key.includes(".")) {
        return t(key as any, params as any);
      }
      // Otherwise, assume it's within the zod.error namespace
      return t(key as any, params as any);
    },
    [t]
  );

  /**
   * Get translated error message for a specific form field
   *
   * @param form - React Hook Form's useForm return value
   * @param field - Field name to get error for
   * @returns Translated error message or undefined if no error
   */
  const getZodError = useCallback(
    (
      form: UseFormReturn<TFieldValues>,
      field: FieldPath<TFieldValues>
    ): string | undefined => {
      const fieldError = form.formState.errors[field];

      if (!fieldError) return undefined;

      // Handle Zod errors directly from zodResolver
      // The structure depends on how you've configured zodResolver
      if (fieldError.type === "custom" && fieldError.message) {
        return String(fieldError.message);
      }

      // Fall back to regular react-hook-form error message
      return fieldError.message ? String(fieldError.message) : undefined;
    },
    []
  );

  /**
   * Get all field errors from a Zod error object
   *
   * @param error - Zod error object
   * @returns Object mapping field paths to translated error messages
   */
  const getAllZodErrors = useCallback(
    (error: z.ZodError): Record<string, string> => {
      const result: Record<string, string> = {};
      const flattened = flattenZodErrors(error);

      for (const item of flattened) {
        result[item.path] = translateZodError(translate, item.key, item.params);
      }

      return result;
    },
    [translate]
  );

  /**
   * Format a Zod error for direct use
   *
   * @param error - Raw Zod error object
   * @param fieldName - Optional field name to extract a specific error
   * @returns Translated error message or undefined
   */
  const formatZodError = useCallback(
    (
      error: z.ZodError,
      fieldName?: string
    ): string | Record<string, string> => {
      if (fieldName) {
        const flattened = flattenZodErrors(error);
        const fieldError = flattened.find((err) => err.path === fieldName);
        return fieldError
          ? translateZodError(translate, fieldError.key, fieldError.params)
          : "";
      }

      return getAllZodErrors(error);
    },
    [getAllZodErrors, translate]
  );

  return {
    getZodError,
    getAllZodErrors,
    formatZodError,
  };
}
