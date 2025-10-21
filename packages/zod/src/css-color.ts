/**
 * CSS Color Value Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for CSS color values,
 * ensuring they conform to valid CSS syntax while blocking potentially dangerous
 * injection patterns like url(), javascript:, and script tags.
 * @module CSSColorValidation
 */
import * as z from "zod";

/**
 * Validates that a CSS value doesn't contain dangerous patterns
 * Blocks: url(), <script>, javascript:, expression(), import
 */
function isDangerousCSS(value: string): boolean {
  const lower = value.toLowerCase();
  return (
    lower.includes("url(") ||
    lower.includes("<") ||
    lower.includes("javascript:") ||
    lower.includes("expression(") ||
    lower.includes("import")
  );
}

/**
 * Validates that a value matches valid CSS color syntax
 * Accepts: hex, oklch, hsl, rgb, rgba, var(), gradients, rem units
 */
function isValidCSSValue(value: string): boolean {
  return (
    /^#[\da-f]{3,8}$/i.test(value) || // hex colors
    /^oklch\(.+\)$/i.test(value) || // oklch
    /^hsl\(.+\)$/i.test(value) || // hsl
    /^rgb\(.+\)$/i.test(value) || // rgb
    /^rgba\(.+\)$/i.test(value) || // rgba
    /^var\(.+\)$/i.test(value) || // CSS variables
    /^[\d.]+rem$/.test(value) || // rem units
    /^linear-gradient\(.+\)$/i.test(value) // gradients
  );
}

/**
 * Zod schema for validating CSS color/value strings
 *
 * This schema provides comprehensive validation for CSS values with the following features:
 * - Maximum length validation (256 characters)
 * - Security checks to block injection vectors
 * - Format validation for standard CSS color syntaxes
 * - Support for CSS variables and gradients
 *
 * Accepted formats:
 * - Hex colors: #fff, #ffffff, #ffffffff
 * - OKLCH colors: oklch(0.5 0.2 180)
 * - HSL colors: hsl(180, 50%, 50%)
 * - RGB colors: rgb(255, 0, 0), rgba(255, 0, 0, 0.5)
 * - CSS variables: var(--my-color)
 * - Gradients: linear-gradient(...)
 * - Rem units: 0.625rem
 *
 * Blocked patterns:
 * - url() - prevents external resource loading
 * - <script> - prevents XSS via style injection
 * - javascript: - prevents JS execution
 * - expression() - prevents IE expression injection
 * - import - prevents CSS import injection
 * @example
 * ```typescript
 * // Valid color values
 * cssColor.parse("#ff0000");
 * cssColor.parse("oklch(0.5 0.2 180)");
 * cssColor.parse("var(--primary-color)");
 * cssColor.parse("0.625rem");
 *
 * // Safe parsing with error handling
 * const result = cssColor.safeParse("url(javascript:alert(1))");
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 * ```
 * @throws {ZodError} When the input fails validation (dangerous content or invalid format)
 */
export const cssColor = z
  .string()
  .max(256, "CSS value must be at most 256 characters")
  .refine((val) => !isDangerousCSS(val), {
    message: "CSS value contains potentially dangerous content",
  })
  .refine(isValidCSSValue, {
    message: "Invalid CSS color or value format",
  })
  .describe("A valid CSS color or value (hex, oklch, hsl, rgb, var, gradient)");

/**
 * Type representing a validated CSS color value
 */
export type CSSColor = z.infer<typeof cssColor>;

/**
 * Type guard function to check if a value is a valid CSS color
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid CSS color, `false` otherwise
 * @example
 * ```typescript
 * if (isCSSColor(userInput)) {
 *   // TypeScript knows userInput is CSSColor
 *   console.log(`Valid CSS color: ${userInput}`);
 * }
 * ```
 */
export function isCSSColor(value: unknown): value is CSSColor {
  return cssColor.safeParse(value).success;
}

/**
 * Parse and validate a CSS color with error throwing
 * @param value - The value to parse and validate
 * @returns The validated CSS color string
 * @throws {ZodError} When the input fails validation
 * @example
 * ```typescript
 * try {
 *   const color = getCSSColor("#ff0000");
 *   console.log(`Valid color: ${color}`);
 * } catch (error) {
 *   console.error("Validation failed:", error.message);
 * }
 * ```
 */
export function getCSSColor(value: unknown): CSSColor {
  return cssColor.parse(value);
}
