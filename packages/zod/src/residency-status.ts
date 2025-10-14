/**
 * Residency Status Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating residency status,
 * ensuring consistency across database schemas and frontend forms for KYC compliance.
 * Designed to support the asset tokenization platform's regulatory requirements.
 * @module ResidencyStatusValidation
 */
import * as z from "zod";

/**
 * Tuple of valid residency status values for type-safe iteration.
 * @remarks
 * This constant defines all supported residency statuses in the platform:
 * - `resident`: Person is a tax resident of the country
 * - `non_resident`: Person is not a tax resident of the country
 * - `dual_resident`: Person has dual residency status
 * - `unknown`: Residency status has not been determined
 */
export const residencyStatuses = [
  "resident",
  "non_resident",
  "dual_resident",
  "unknown",
] as const;

/**
 * Enum-like object for dot notation access to residency status values.
 * Provides a convenient way to reference residency statuses in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (userStatus === ResidencyStatusEnum.resident) {
 *   console.log("User is a resident");
 * }
 *
 * // Use in switch statements
 * switch (residencyStatus) {
 *   case ResidencyStatusEnum.resident:
 *     applyResidentTaxRules();
 *     break;
 *   case ResidencyStatusEnum.non_resident:
 *     applyNonResidentTaxRules();
 *     break;
 *   case ResidencyStatusEnum.dual_resident:
 *     applyDualResidentRules();
 *     break;
 * }
 * ```
 */
export const ResidencyStatusEnum = {
  resident: "resident",
  non_resident: "non_resident",
  dual_resident: "dual_resident",
  unknown: "unknown",
} as const;

/**
 * Creates a Zod schema that validates a residency status.
 * @remarks
 * Features:
 * - Strict enum validation against predefined residency statuses
 * - Type-safe inference
 * - Descriptive error messages for invalid inputs
 * - Case-sensitive matching (must match exact casing with underscores)
 * @returns A Zod enum schema for residency status validation
 * @example
 * ```typescript
 * const schema = residencyStatus();
 * schema.parse("resident"); // Returns "resident" as ResidencyStatus
 * schema.parse("non_resident"); // Returns "non_resident" as ResidencyStatus
 * schema.parse("invalid"); // Throws ZodError
 *
 * // Use in form validation
 * const kycSchema = z.object({
 *   country: z.string(),
 *   residencyStatus: residencyStatus(),
 *   nationalId: z.string()
 * });
 * ```
 */
export const residencyStatus = () =>
  z.enum(residencyStatuses).describe("Tax residency status of the individual");

/**
 * Creates an array validator for multiple residency statuses.
 * Ensures at least one residency status is selected.
 * @returns A Zod array schema that validates a list of residency statuses
 * @example
 * ```typescript
 * const schema = residencyStatusArray();
 * schema.parse(["resident", "dual_resident"]); // Valid
 * schema.parse([]); // Invalid - empty array
 * schema.parse(["invalid"]); // Invalid - unknown status
 * ```
 */
export const residencyStatusArray = () =>
  z
    .array(residencyStatus())
    .min(1, "At least one residency status must be selected")
    .describe("List of residency statuses");

/**
 * Creates a residency status validator with an optional default value.
 * Useful for forms where a default selection is needed.
 * @param defaultValue - The default residency status (defaults to "unknown")
 * @returns A Zod schema with a default value
 * @example
 * ```typescript
 * const schema = residencyStatusWithDefault("resident");
 * schema.parse(undefined); // Returns "resident"
 * schema.parse("non_resident"); // Returns "non_resident"
 * ```
 */
export const residencyStatusWithDefault = (
  defaultValue: ResidencyStatus = residencyStatus().parse("unknown")
) => residencyStatus().default(defaultValue);

/**
 * Type representing a validated residency status.
 * Ensures type safety for KYC and compliance operations.
 */
export type ResidencyStatus = z.infer<ReturnType<typeof residencyStatus>>;

/**
 * Type representing an array of validated residency statuses.
 */
export type ResidencyStatusArray = z.infer<
  ReturnType<typeof residencyStatusArray>
>;

/**
 * Type guard to check if a value is a valid residency status.
 * @param value - The value to check
 * @returns `true` if the value is a valid residency status, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "resident";
 * if (isResidencyStatus(userInput)) {
 *   // TypeScript knows userInput is ResidencyStatus here
 *   console.log(`User residency status: ${userInput}`);
 * }
 * ```
 */
export function isResidencyStatus(value: unknown): value is ResidencyStatus {
  return residencyStatus().safeParse(value).success;
}

/**
 * Safely parse and return a residency status or throw an error.
 * @param value - The value to parse
 * @returns The validated residency status
 * @throws {Error} If the value is not a valid residency status
 * @example
 * ```typescript
 * try {
 *   const status = getResidencyStatus("resident"); // Returns "resident" as ResidencyStatus
 *   const invalid = getResidencyStatus("permanent"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid residency status provided");
 * }
 * ```
 */
export function getResidencyStatus(value: unknown): ResidencyStatus {
  return residencyStatus().parse(value);
}

/**
 * Type guard to check if a value is a valid residency status array.
 * @param value - The value to check
 * @returns `true` if the value is a valid residency status array, `false` otherwise
 * @example
 * ```typescript
 * if (isResidencyStatusArray(["resident", "non_resident"])) {
 *   console.log("Valid residency status array");
 * }
 * ```
 */
export function isResidencyStatusArray(
  value: unknown
): value is ResidencyStatusArray {
  return residencyStatusArray().safeParse(value).success;
}

/**
 * Safely parse and return a residency status array or throw an error.
 * @param value - The value to parse
 * @returns The validated residency status array
 * @throws {Error} If the value is not a valid residency status array
 * @example
 * ```typescript
 * const statuses = getResidencyStatusArray(["resident", "dual_resident"]); // Valid
 * const empty = getResidencyStatusArray([]); // Throws Error - empty array
 * ```
 */
export function getResidencyStatusArray(value: unknown): ResidencyStatusArray {
  return residencyStatusArray().parse(value);
}
