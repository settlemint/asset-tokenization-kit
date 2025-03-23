/**
 * Utilities for handling Zod error translations with dynamic values
 *
 * This module provides functions to translate Zod validation errors,
 * including handling dynamic values like minimum/maximum limits.
 */
import type { ZodIssue } from "zod";
import { z } from "zod";

/**
 * Get translation parameters for a Zod validation error
 *
 * Extracts dynamic values from a Zod error issue that need to be
 * interpolated into the translated message.
 *
 * @param issue - The Zod validation issue
 * @returns Object with parameters for translation interpolation
 */
export function getZodErrorParams(
  issue: ZodIssue
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  // Add error code
  params.code = issue.code;

  // Extract type-specific parameters
  switch (issue.code) {
    case "invalid_type":
      const typeIssue = issue as z.ZodInvalidTypeIssue;
      params.expected = typeIssue.expected;
      params.received = typeIssue.received;
      break;

    case "too_small":
    case "too_big":
      const sizeIssue = issue as z.ZodIssueBase & {
        minimum?: number | bigint;
        maximum?: number | bigint;
        type: string;
        inclusive: boolean;
      };

      if ("minimum" in issue && issue.minimum !== undefined) {
        // Convert bigint to string to ensure safe serialization
        params.minimum =
          typeof issue.minimum === "bigint"
            ? issue.minimum.toString()
            : issue.minimum;
      }

      if ("maximum" in issue && issue.maximum !== undefined) {
        // Convert bigint to string to ensure safe serialization
        params.maximum =
          typeof issue.maximum === "bigint"
            ? issue.maximum.toString()
            : issue.maximum;
      }

      params.type = sizeIssue.type;
      params.inclusive = sizeIssue.inclusive ? "true" : "false";
      break;

    case "invalid_string":
      const stringIssue = issue as z.ZodInvalidStringIssue;
      // Handle string validation which could be complex object or simple string
      if (typeof stringIssue.validation === "string") {
        params.validation = stringIssue.validation;
      } else {
        // For complex validation objects (like includes), convert to string representation
        params.validation = "custom";
      }
      break;

    case "invalid_enum_value":
      const enumIssue = issue as z.ZodInvalidEnumValueIssue;
      params.options = Array.isArray(enumIssue.options)
        ? enumIssue.options.join(", ")
        : String(enumIssue.options);
      break;
  }

  // Add path information
  params.path = issue.path.join(".");

  return params;
}

/**
 * Extract a flat list of all Zod validation errors with their paths and parameters
 *
 * @param error - The Zod error object
 * @returns Array of objects with path, message, and parameters
 */
export function flattenZodErrors(error: z.ZodError): {
  path: string;
  key: string;
  params: Record<string, string | number>;
}[] {
  return error.errors.map((issue) => {
    const path = issue.path.join(".") || "root";
    return {
      path,
      key: issue.message, // This will be our translation key from the error map
      params: getZodErrorParams(issue),
    };
  });
}

/**
 * Translate a Zod error message with dynamic values
 *
 * This function is designed to work with your app's translation function.
 * You'll need to provide the actual translation function from your i18n setup.
 *
 * @param t - Translation function from your i18n library
 * @param key - Translation key (usually from error.message)
 * @param params - Parameters for interpolation
 * @returns Translated string with interpolated values
 */
export function translateZodError(
  t: (key: string, params?: Record<string, string | number>) => string,
  key: string,
  params: Record<string, string | number> = {}
): string {
  return t(key, params);
}

/**
 * Get first Zod error message for a specific form field
 *
 * @param error - The Zod error object
 * @param field - The form field path (e.g., "email", "user.name")
 * @param t - Translation function from your i18n library
 * @returns Translated error message or undefined if no error
 */
export function getFieldError(
  error: z.ZodError | null | undefined,
  field: string,
  t: (key: string, params?: Record<string, string | number>) => string
): string | undefined {
  if (!error) return undefined;

  const flattened = flattenZodErrors(error);
  const fieldError = flattened.find((err) => err.path === field);

  if (!fieldError) return undefined;

  return translateZodError(t, fieldError.key, fieldError.params);
}

/**
 * Simple usage example in a form component:
 *
 * ```tsx
 * import { useForm } from 'react-hook-form';
 * import { zodResolver } from '@hookform/resolvers/zod';
 * import { getFieldError } from '@/lib/utils/zod-translations';
 * import { useTranslations } from 'next-intl'; // or your i18n library
 *
 * export function MyForm() {
 *   const t = useTranslations();
 *   const { register, handleSubmit, formState: { errors } } = useForm({
 *     resolver: zodResolver(mySchema)
 *   });
 *
 *   return (
 *     <form onSubmit={handleSubmit(onSubmit)}>
 *       <input {...register('email')} />
 *       {errors.formErrors && (
 *         <p className="text-red-500">
 *           {getFieldError(errors.formErrors, 'email', t)}
 *         </p>
 *       )}
 *     </form>
 *   );
 * }
 * ```
 */
