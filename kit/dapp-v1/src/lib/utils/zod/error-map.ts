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
  let message: string;

  switch (issue.code) {
    case z.ZodIssueCode.invalid_type:
      if (issue.received === "undefined") {
        message = "validation.required";
      } else {
        message = `validation.invalidType.${issue.expected}`;
      }
      break;

    case z.ZodIssueCode.invalid_literal:
      message = "validation.invalidLiteral";
      break;

    case z.ZodIssueCode.unrecognized_keys:
      message = "validation.unrecognizedKeys";
      break;

    case z.ZodIssueCode.invalid_union:
      message = "validation.invalidUnion";
      break;

    case z.ZodIssueCode.invalid_union_discriminator:
      message = "validation.invalidUnionDiscriminator";
      break;

    case z.ZodIssueCode.invalid_enum_value:
      message = "validation.invalidEnumValue";
      break;

    case z.ZodIssueCode.invalid_arguments:
      message = "validation.invalidArguments";
      break;

    case z.ZodIssueCode.invalid_return_type:
      message = "validation.invalidReturnType";
      break;

    case z.ZodIssueCode.invalid_date:
      message = "validation.invalidDate";
      break;

    case z.ZodIssueCode.invalid_string:
      if (issue.validation === "email") {
        message = "validation.invalidEmail";
      } else if (issue.validation === "url") {
        message = "validation.invalidUrl";
      } else if (issue.validation === "uuid") {
        message = "validation.invalidUuid";
      } else if (issue.validation === "regex") {
        message = "validation.invalidPattern";
      } else if (issue.validation === "cuid") {
        message = "validation.invalidCuid";
      } else if (issue.validation === "datetime") {
        message = "validation.invalidDatetime";
      } else {
        message = `validation.invalidString.${issue.validation}`;
      }
      break;

    case z.ZodIssueCode.too_small:
      if (issue.type === "array") {
        message = issue.exact
          ? "validation.array.exactLength"
          : issue.inclusive
            ? "validation.array.minLength"
            : "validation.array.minLengthExclusive";
      } else if (issue.type === "string") {
        message = issue.exact
          ? "validation.string.exactLength"
          : issue.inclusive
            ? "validation.string.minLength"
            : "validation.string.minLengthExclusive";
      } else if (issue.type === "number") {
        message = issue.exact
          ? "validation.number.exact"
          : issue.inclusive
            ? "validation.number.min"
            : "validation.number.minExclusive";
      } else if (issue.type === "date") {
        message = issue.exact
          ? "validation.date.exact"
          : issue.inclusive
            ? "validation.date.min"
            : "validation.date.minExclusive";
      } else {
        message = "validation.tooSmall";
      }
      break;

    case z.ZodIssueCode.too_big:
      if (issue.type === "array") {
        message = issue.exact
          ? "validation.array.exactLength"
          : issue.inclusive
            ? "validation.array.maxLength"
            : "validation.array.maxLengthExclusive";
      } else if (issue.type === "string") {
        message = issue.exact
          ? "validation.string.exactLength"
          : issue.inclusive
            ? "validation.string.maxLength"
            : "validation.string.maxLengthExclusive";
      } else if (issue.type === "number") {
        message = issue.exact
          ? "validation.number.exact"
          : issue.inclusive
            ? "validation.number.max"
            : "validation.number.maxExclusive";
      } else if (issue.type === "date") {
        message = issue.exact
          ? "validation.date.exact"
          : issue.inclusive
            ? "validation.date.max"
            : "validation.date.maxExclusive";
      } else {
        message = "validation.tooBig";
      }
      break;

    case z.ZodIssueCode.custom:
      // For custom errors, we expect the message to already be a translation key
      message = issue.message || "validation.custom.default";
      break;

    case z.ZodIssueCode.invalid_intersection_types:
      message = "validation.invalidIntersection";
      break;

    case z.ZodIssueCode.not_multiple_of:
      message = "validation.notMultipleOf";
      break;

    case z.ZodIssueCode.not_finite:
      message = "validation.notFinite";
      break;

    default:
      message = "validation.default";
  }

  return { message };
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
