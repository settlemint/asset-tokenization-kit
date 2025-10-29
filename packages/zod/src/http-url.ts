/**
 * HTTP/HTTPS URL Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for HTTP and HTTPS URLs,
 * ensuring they conform to valid URL syntax and use secure protocols.
 * @module HTTPURLValidation
 */
import { z } from "zod";

/**
 * Validates that a string is a valid HTTP or HTTPS URL
 */
function validateHTTPURL(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Zod schema for validating HTTP/HTTPS URLs
 *
 * This schema provides comprehensive validation for web URLs with the following features:
 * - Valid URL format validation
 * - Protocol restriction to http: and https: only
 * - Proper hostname and path validation
 * - Maximum length validation (2048 characters)
 *
 * The validation process follows these steps:
 * 1. Check string length (must be ≤ 2048 characters)
 * 2. Validate URL format using URL constructor
 * 3. Verify protocol is http: or https:
 * 4. Return validated URL string
 * @example
 * ```typescript
 * // Valid URL parsing
 * httpURL.parse("https://example.com");
 * httpURL.parse("http://localhost:3000/path");
 * httpURL.parse("https://api.example.com/v1/users?id=123");
 *
 * // Safe parsing with error handling
 * const result = httpURL.safeParse("ftp://example.com");
 * if (result.success) {
 *   console.log(result.data);
 * } else {
 *   console.error(result.error.issues); // Protocol not allowed
 * }
 *
 * // Type guard usage
 * if (isHTTPURL(userInput)) {
 *   // TypeScript knows userInput is HTTPURL
 *   console.log(`Valid URL: ${userInput}`);
 * }
 * ```
 * @throws {ZodError} When the input fails validation
 */
export const httpURL = z
  .string()
  .max(2048, "URL must be at most 2048 characters")
  .refine(validateHTTPURL, {
    message: "Must be a valid HTTP or HTTPS URL",
  })
  .describe("A valid HTTP or HTTPS URL");

/**
 * Type representing a validated HTTP/HTTPS URL
 */
export type HTTPURL = z.infer<typeof httpURL>;

/**
 * Type guard function to check if a value is a valid HTTP/HTTPS URL
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid HTTP/HTTPS URL, `false` otherwise
 * @example
 * ```typescript
 * if (isHTTPURL(userInput)) {
 *   // TypeScript knows userInput is HTTPURL
 *   console.log(`Valid URL: ${userInput}`);
 * }
 * ```
 */
export function isHTTPURL(value: unknown): value is HTTPURL {
  return httpURL.safeParse(value).success;
}

/**
 * Parse and validate an HTTP/HTTPS URL with error throwing
 * @param value - The value to parse and validate
 * @returns The validated URL string
 * @throws {ZodError} When the input fails validation
 * @example
 * ```typescript
 * try {
 *   const url = getHTTPURL("https://example.com");
 *   console.log(`Valid URL: ${url}`);
 * } catch (error) {
 *   console.error("Validation failed:", error.message);
 * }
 * ```
 */
export function getHTTPURL(value: unknown): HTTPURL {
  return httpURL.parse(value);
}
