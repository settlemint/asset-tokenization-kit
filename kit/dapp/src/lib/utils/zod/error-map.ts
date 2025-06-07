/**
 * Internationalized Zod Error Map
 *
 * This module provides a custom error map for Zod that returns translation keys
 * instead of hardcoded messages. This enables proper internationalization (i18n)
 * of validation error messages throughout the application.
 *
 * @module ZodErrorMap
 */
import { z } from "zod";

/**
 * Custom error map that returns translation keys for Zod validation errors.
 *
 * @remarks
 * This error map integrates with next-intl by returning translation keys
 * that can be resolved in the frontend. The keys follow a consistent pattern:
 * - Base errors: `validation.{issueCode}.{details}`
 * - Custom errors: `validation.custom.{validator}.{error}`
 *
 * @param issue - The Zod issue containing error details
 * @param ctx - The error map context with default message
 * @returns Translation key string for the error
 *
 * @example
 * ```typescript
 * // In your component
 * import { useTranslations } from 'next-intl';
 * import { z } from 'zod';
 * import { zodErrorMap } from './error-map';
 *
 * // Set the error map globally
 * z.setErrorMap(zodErrorMap);
 *
 * // Or use it for a specific schema
 * const schema = z.string().min(5);
 * const result = schema.safeParse("abc", { errorMap: zodErrorMap });
 *
 * // In your component
 * const t = useTranslations();
 * if (!result.success) {
 *   const errorKey = result.error.issues[0].message;
 *   const errorMessage = t(errorKey);
 * }
 * ```
 */
export const zodErrorMap: z.ZodErrorMap = (issue, ctx) => {
  // Handle different error types and return appropriate translation keys
  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined") {
        return "validation.required";
      }
      return `validation.invalidType.${issue.expected}`;

    case z.ZodIssueCode.invalid_literal:
      return "validation.invalidLiteral";

    case z.ZodIssueCode.unrecognized_keys:
      return "validation.unrecognizedKeys";

    case z.ZodIssueCode.invalid_union:
      return "validation.invalidUnion";

    case z.ZodIssueCode.invalid_union_discriminator:
      return "validation.invalidUnionDiscriminator";

    case z.ZodIssueCode.invalid_enum_value:
      return "validation.invalidEnumValue";

    case z.ZodIssueCode.invalid_arguments:
      return "validation.invalidArguments";

    case z.ZodIssueCode.invalid_return_type:
      return "validation.invalidReturnType";

    case z.ZodIssueCode.invalid_date:
      return "validation.invalidDate";

    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        return "validation.invalidEmail";
      }
      if (issue.validation === "url") {
        return "validation.invalidUrl";
      }
      if (issue.validation === "uuid") {
        return "validation.invalidUuid";
      }
      if (issue.validation === "regex") {
        return "validation.invalidPattern";
      }
      if (issue.validation === "cuid") {
        return "validation.invalidCuid";
      }
      if (issue.validation === "datetime") {
        return "validation.invalidDatetime";
      }
      return `validation.invalidString.${issue.validation}`;

    case z.ZodIssueCode.too_small:
      if (issue.type === "array") {
        return issue.exact
          ? "validation.array.exactLength"
          : issue.inclusive
            ? "validation.array.minLength"
            : "validation.array.minLengthExclusive";
      }
      if (issue.type === "string") {
        return issue.exact
          ? "validation.string.exactLength"
          : issue.inclusive
            ? "validation.string.minLength"
            : "validation.string.minLengthExclusive";
      }
      if (issue.type === "number") {
        return issue.exact
          ? "validation.number.exact"
          : issue.inclusive
            ? "validation.number.min"
            : "validation.number.minExclusive";
      }
      if (issue.type === "date") {
        return issue.exact
          ? "validation.date.exact"
          : issue.inclusive
            ? "validation.date.min"
            : "validation.date.minExclusive";
      }
      return "validation.tooSmall";

    case z.ZodIssueCode.too_big:
      if (issue.type === "array") {
        return issue.exact
          ? "validation.array.exactLength"
          : issue.inclusive
            ? "validation.array.maxLength"
            : "validation.array.maxLengthExclusive";
      }
      if (issue.type === "string") {
        return issue.exact
          ? "validation.string.exactLength"
          : issue.inclusive
            ? "validation.string.maxLength"
            : "validation.string.maxLengthExclusive";
      }
      if (issue.type === "number") {
        return issue.exact
          ? "validation.number.exact"
          : issue.inclusive
            ? "validation.number.max"
            : "validation.number.maxExclusive";
      }
      if (issue.type === "date") {
        return issue.exact
          ? "validation.date.exact"
          : issue.inclusive
            ? "validation.date.max"
            : "validation.date.maxExclusive";
      }
      return "validation.tooBig";

    case z.ZodIssueCode.custom:
      // For custom errors, we expect the message to already be a translation key
      return issue.message || "validation.custom.default";

    case z.ZodIssueCode.invalid_intersection_types:
      return "validation.invalidIntersection";

    case z.ZodIssueCode.not_multiple_of:
      return "validation.notMultipleOf";

    case z.ZodIssueCode.not_finite:
      return "validation.notFinite";

    default:
      return "validation.default";
  }
};

/**
 * Helper function to create custom validation error keys.
 *
 * @param validator - The validator name (e.g., "ethereumAddress", "isin")
 * @param error - The specific error type (e.g., "invalidFormat", "tooShort")
 * @returns A properly formatted translation key
 *
 * @example
 * ```typescript
 * // In a custom validator
 * .refine(
 *   (value) => isValidAddress(value),
 *   { message: customErrorKey("ethereumAddress", "invalidFormat") }
 * )
 * ```
 */
export function customErrorKey(validator: string, error: string): string {
  return `validation.custom.${validator}.${error}`;
}

/**
 * Type-safe helper to ensure translation keys exist.
 * This can be used with your translation type definitions.
 */
export type ValidationTranslationKey =
  | `validation.${string}`
  | `validation.custom.${string}.${string}`;
