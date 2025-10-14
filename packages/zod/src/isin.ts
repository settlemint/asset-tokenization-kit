/**
 * ISIN Validation Utilities
 *
 * This module provides comprehensive Zod-based validation for International Securities
 * Identification Numbers (ISIN), ensuring they conform to the ISO 6166 standard
 * with proper format validation and checksum verification capabilities.
 * @module ISINValidation
 */
import * as z from "zod";

/**
 * Validates an ISIN using the Luhn algorithm checksum.
 * @param isin - The ISIN string to validate
 * @returns `true` if the checksum is valid, `false` otherwise
 */
function validateIsinChecksum(isin: string): boolean {
  // First, expand alphanumeric characters to their numeric values
  let expandedString = "";

  // Process all 12 characters
  for (let i = 0; i < 12; i++) {
    const char = isin[i];
    if (!char) return false;

    if (char >= "0" && char <= "9") {
      expandedString += char;
    } else if (char >= "A" && char <= "Z") {
      // A=10, B=11, ..., Z=35
      // Since we've already validated the character is A-Z, codePointAt will return a value
      const charCode = char.codePointAt(0) ?? 0;
      const aCode = "A".codePointAt(0) ?? 0;
      expandedString += (charCode - aCode + 10).toString();
    } else {
      return false;
    }
  }

  // Apply Luhn algorithm to the expanded string
  let sum = 0;
  let alternate = false;

  // Process from right to left
  for (let i = expandedString.length - 1; i >= 0; i--) {
    const char = expandedString[i];
    if (!char) continue;
    let digit = Number.parseInt(char, 10);

    if (alternate) {
      digit *= 2;
      if (digit > 9) {
        digit = (digit % 10) + 1;
      }
    }

    sum += digit;
    alternate = !alternate;
  }

  // The sum should be divisible by 10
  return sum % 10 === 0;
}

/**
 * Zod schema for validating International Securities Identification Numbers (ISIN)
 *
 * This schema provides comprehensive validation for ISIN codes with the following features:
 * - Exact length validation (must be 12 characters)
 * - Format validation: 2 uppercase letters + 9 alphanumeric + 1 check digit
 * - Country code validation (first 2 characters)
 * - National Securities Identifying Number validation (middle 9 characters)
 * - Check digit validation (last character)
 *
 * ISIN format breakdown:
 * - Characters 1-2: ISO 3166-1 alpha-2 country code (e.g., "US", "GB", "DE")
 * - Characters 3-11: National Securities Identifying Number (NSIN) - alphanumeric
 * - Character 12: Check digit calculated using Luhn algorithm
 *
 * The validation process follows these steps:
 * 1. Check string length (must be exactly 12 characters)
 * 2. Validate format using regex pattern
 * 3. Verify country code format (2 uppercase letters)
 * 4. Validate NSIN format (9 alphanumeric characters)
 * 5. Validate check digit format (1 numeric character)
 * 6. Return as branded ISIN type
 * @example
 * ```typescript
 * // Valid ISIN parsing
 * const appleISIN = isin().parse("US0378331005");
 * // Returns: "US0378331005" (Apple Inc.)
 * // Type: string
 *
 * const microsoftISIN = isin().parse("US5949181045");
 * // Returns: "US5949181045" (Microsoft Corp.)
 *
 * const deutscheTelekomISIN = isin().parse("DE0005557508");
 * // Returns: "DE0005557508" (Deutsche Telekom)
 *
 * // Safe parsing with error handling
 * const result = isin().safeParse("INVALID123");
 * if (result.success) {
 *   console.log(result.data); // Valid ISIN
 * } else {
 *   console.error(result.error.issues); // Validation errors
 * }
 *
 * // Type guard usage
 * if (isISIN(userInput)) {
 *   // TypeScript knows userInput is ISIN
 *   console.log(`Valid ISIN: ${userInput}`);
 * }
 * ```
 * @throws {ZodError} When the input fails validation at any step
 */
export const isin = () =>
  z
    .string()
    .transform((val) => val.toUpperCase())
    .pipe(
      z
        .string()
        .min(12, "ISIN must be exactly 12 characters long")
        .max(12, "ISIN must be exactly 12 characters long")
        .regex(
          /^[A-Z]{2}[A-Z0-9]{9}[0-9]$/,
          "ISIN must follow the format: 2 letter country code + 9 alphanumeric characters + 1 check digit"
        )
        .refine(validateIsinChecksum, "Invalid ISIN checksum")
    )
    .describe("International Securities Identification Number");

// Note: Global registry functionality removed as it's not available in Zod v4

/**
 * Type representing a validated International Securities Identification Number
 *
 * This type ensures that only validated ISIN codes can be assigned to variables of this type.
 */
export type ISIN = z.infer<ReturnType<typeof isin>>;

/**
 * Type guard function to check if a value is a valid ISIN
 *
 * This function provides runtime type checking for ISIN codes,
 * useful for conditional logic and type narrowing in TypeScript.
 * @param value - The value to validate (can be any type)
 * @returns `true` if the value is a valid ISIN, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "US0378331005";
 *
 * if (isISIN(userInput)) {
 *   // TypeScript now knows userInput is ISIN
 *   console.log(`Valid ISIN: ${userInput}`);
 * } else {
 *   console.error("Invalid ISIN provided");
 * }
 * ```
 */
export function isISIN(value: unknown): value is ISIN {
  const result = isin().safeParse(value);
  return result.success;
}

/**
 * Safely parse and validate an ISIN with error throwing
 *
 * This function attempts to parse and validate an ISIN code,
 * throwing a ZodError if validation fails. Use this when you expect
 * the input to be valid and want to handle errors at a higher level.
 * @param value - The value to parse and validate (can be any type)
 * @returns The validated ISIN code
 * @throws {Error} When the input fails validation
 * @example
 * ```typescript
 * try {
 *   const isinCode = getISIN("US0378331005");
 *   console.log(`Valid ISIN: ${isinCode}`);
 * } catch (error) {
 *   console.error("Validation failed:", error.message);
 * }
 * ```
 */
export function getISIN(value: unknown): ISIN {
  return isin().parse(value);
}
