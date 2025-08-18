/**
 * Fund Class Validation Utilities
 *
 * This module provides Zod schemas for validating fund share classes,
 * which differentiate investor types based on qualification requirements,
 * minimum investments, and fee structures.
 * @module FundClassValidation
 */
import { z } from "zod";

/**
 * Available fund share classes based on investor qualification.
 * @remarks
 * Investor classifications for fund participation:
 * - `institutional`: For large institutional investors (pension funds, endowments)
 * - `retail`: For individual retail investors with standard requirements
 * - `accredited`: For qualified investors meeting income/asset thresholds
 */
export const fundClasses = ["institutional", "retail", "accredited"] as const;

/**
 * Creates a Zod schema that validates fund share classes.
 * @returns A Zod enum schema for fund class validation
 * @example
 * ```typescript
 * const schema = fundClass();
 *
 * // Valid classes
 * schema.parse("institutional"); // Large investor class
 * schema.parse("retail");        // Public investor class
 * schema.parse("accredited");    // Qualified investor class
 *
 * // Invalid class
 * schema.parse("premium"); // Throws ZodError
 * ```
 */
export const fundClass = () => z.enum(fundClasses).describe("Class of fund shares");

/**
 * Type representing a validated fund share class.
 * Ensures type safety.
 */
export type FundClass = z.infer<ReturnType<typeof fundClass>>;

/**
 * Type guard to check if a value is a valid fund class.
 * @param value - The value to check
 * @returns `true` if the value is a valid fund class, `false` otherwise
 * @example
 * ```typescript
 * const shareClass: unknown = "retail";
 * if (isFundClass(shareClass)) {
 *   // TypeScript knows shareClass is FundClass
 *   console.log(`Valid fund class: ${shareClass}`);
 *
 *   // Apply class-specific logic
 *   if (shareClass === "institutional") {
 *     applyInstitutionalFeeStructure();
 *   } else if (shareClass === "accredited") {
 *     verifyAccreditedStatus();
 *   }
 * }
 * ```
 */
export function isFundClass(value: unknown): value is FundClass {
  return fundClass().safeParse(value).success;
}

/**
 * Safely parse and return a fund class or throw an error.
 * @param value - The value to parse as a fund class
 * @returns The validated fund class
 * @throws {Error} If the value is not a valid fund class
 * @example
 * ```typescript
 * try {
 *   const shareClass = getFundClass("institutional"); // Returns "institutional"
 *   const invalid = getFundClass("vip"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid fund class provided");
 * }
 *
 * // Use in investor onboarding
 * const investorClass = getFundClass(request.investorType);
 * allocateFundShares(investor, investorClass, amount);
 * ```
 */
export function getFundClass(value: unknown): FundClass {
  return fundClass().parse(value);
}
