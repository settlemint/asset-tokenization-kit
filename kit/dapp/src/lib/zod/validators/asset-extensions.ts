/**
 * Asset Extension Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating token extensions,
 * ensuring they match predefined enumerations. It's designed to support the
 * asset tokenization platform's various token capabilities and features.
 * @module AssetExtensionValidation
 */
import { z } from "zod";

/**
 * Enum-like object for dot notation access to asset extensions.
 * Provides a convenient way to reference extensions in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (token.extensions.includes(AssetExtensionEnum.CUSTODIAN)) {
 *   console.log("Token supports custodial operations");
 * }
 *
 * // Use in switch statements
 * switch (extension) {
 *   case AssetExtensionEnum.BURNABLE:
 *     enableBurnFeature();
 *     break;
 *   case AssetExtensionEnum.PAUSABLE:
 *     enablePauseFeature();
 *     break;
 * }
 * ```
 */
export const AssetExtensionEnum = {
  ACCESS_MANAGED: "ACCESS_MANAGED",
  BOND: "BOND",
  BURNABLE: "BURNABLE",
  CAPPED: "CAPPED",
  COLLATERAL: "COLLATERAL",
  CUSTODIAN: "CUSTODIAN",
  FUND: "FUND",
  HISTORICAL_BALANCES: "HISTORICAL_BALANCES",
  PAUSABLE: "PAUSABLE",
  REDEEMABLE: "REDEEMABLE",
  YIELD: "YIELD",
} as const;

/**
 * Tuple of valid asset extensions for type-safe iteration.
 * @remarks
 * This constant defines all supported token extensions in the platform.
 * The array is typed with the GraphQL-derived type to ensure compile-time
 * type safety between our TypeScript definitions and the GraphQL schema.
 *
 * Extensions:
 * - `ACCESS_MANAGED`: Managed access control extension
 * - `BOND`: Bond-specific functionality
 * - `BURNABLE`: Ability to burn/destroy tokens
 * - `CAPPED`: Maximum supply cap enforcement
 * - `COLLATERAL`: Collateral management capabilities
 * - `CUSTODIAN`: Custodial operations (freeze, forced transfers)
 * - `FUND`: Fund-specific functionality
 * - `HISTORICAL_BALANCES`: Track historical balance snapshots
 * - `PAUSABLE`: Ability to pause token operations
 * - `REDEEMABLE`: Token redemption capabilities
 * - `YIELD`: Yield/interest generation features
 */
export const assetExtensions = Object.values(AssetExtensionEnum);

/**
 * Creates a Zod schema that validates an asset extension.
 * @remarks
 * Features:
 * - Strict enum validation against predefined asset extensions
 * - Type-safe inference
 * - Descriptive error messages for invalid inputs
 * - Case-sensitive matching (must be uppercase with underscores)
 * @returns A Zod enum schema for asset extension validation
 * @example
 * ```typescript
 * const schema = assetExtension();
 * schema.parse("BURNABLE"); // Returns "BURNABLE" as AssetExtension
 * schema.parse("invalid"); // Throws ZodError
 *
 * // Use in form validation
 * const formSchema = z.object({
 *   extensions: z.array(assetExtension()),
 *   amount: z.number()
 * });
 * ```
 */
export const assetExtension = () =>
  z.enum(assetExtensions).describe("Token extension capability");

/**
 * Creates an array validator for multiple asset extensions.
 * @returns A Zod array schema that validates a list of asset extensions
 * @example
 * ```typescript
 * const schema = assetExtensionArray();
 * schema.parse(["BURNABLE", "PAUSABLE"]); // Valid
 * schema.parse([]); // Valid - empty array is allowed
 * schema.parse(["INVALID"]); // Invalid - unknown extension
 * ```
 */
export const assetExtensionArray = () =>
  z.array(assetExtension()).describe("List of asset extensions");

/**
 * Creates a set validator for unique asset extensions.
 * Automatically removes duplicates.
 * @returns A Zod set schema that validates unique asset extensions
 * @example
 * ```typescript
 * const schema = assetExtensionSet();
 * schema.parse(new Set(["BURNABLE", "PAUSABLE"])); // Valid
 * schema.parse(new Set(["BURNABLE", "BURNABLE"])); // Valid - duplicates removed
 * schema.parse(new Set()); // Valid - empty set is allowed
 * ```
 */
export const assetExtensionSet = () =>
  z.set(assetExtension()).describe("Set of unique asset extensions");

/**
 * Creates an asset extension validator with an optional default value.
 * Useful for forms where a default selection is needed.
 * @param defaultValue - The default extension (defaults to "BURNABLE")
 * @returns A Zod schema with a default value
 * @example
 * ```typescript
 * const schema = assetExtensionWithDefault("PAUSABLE");
 * schema.parse(undefined); // Returns "PAUSABLE"
 * schema.parse("BURNABLE"); // Returns "BURNABLE"
 * ```
 */
export const assetExtensionWithDefault = (
  defaultValue: AssetExtension = assetExtension().parse("BURNABLE")
) => assetExtension().default(defaultValue);

/**
 * Creates a record validator for asset extension to value mappings.
 * Creates a partial record where not all extensions need to be present.
 * @template T - The Zod type for the values in the record
 * @param valueSchema - The schema to validate each value
 * @returns A Zod object schema with optional fields for each extension
 * @example
 * ```typescript
 * // Create a schema for extension configurations
 * const configSchema = assetExtensionRecord(z.object({
 *   enabled: z.boolean(),
 *   gasLimit: z.number()
 * }));
 *
 * // Valid - partial configurations
 * configSchema.parse({
 *   BURNABLE: { enabled: true, gasLimit: 100000 },
 *   PAUSABLE: { enabled: false, gasLimit: 50000 }
 * });
 *
 * // Invalid - unknown extension
 * configSchema.parse({
 *   INVALID: { enabled: true, gasLimit: 100000 }
 * });
 * ```
 */
export const assetExtensionRecord = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      ACCESS_MANAGED: valueSchema.optional(),
      BOND: valueSchema.optional(),
      BURNABLE: valueSchema.optional(),
      CAPPED: valueSchema.optional(),
      COLLATERAL: valueSchema.optional(),
      CUSTODIAN: valueSchema.optional(),
      FUND: valueSchema.optional(),
      HISTORICAL_BALANCES: valueSchema.optional(),
      PAUSABLE: valueSchema.optional(),
      REDEEMABLE: valueSchema.optional(),
      YIELD: valueSchema.optional(),
    })
    .strict() // Prevent unknown keys
    .describe("Mapping of asset extensions to values");

// Export types
/**
 * Type representing a validated asset extension.
 * Ensures type safety.
 */
export type AssetExtension = z.infer<ReturnType<typeof assetExtension>>;

/**
 * Type representing an array of validated asset extensions.
 */
export type AssetExtensionArray = z.infer<
  ReturnType<typeof assetExtensionArray>
>;

/**
 * Type representing a set of unique validated asset extensions.
 */
export type AssetExtensionSet = z.infer<ReturnType<typeof assetExtensionSet>>;

/**
 * Type guard to check if a value is a valid asset extension.
 * @param value - The value to check
 * @returns `true` if the value is a valid asset extension, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "BURNABLE";
 * if (isAssetExtension(userInput)) {
 *   // TypeScript knows userInput is AssetExtension here
 *   console.log(`Processing ${userInput} extension`);
 * }
 * ```
 */
export function isAssetExtension(value: unknown): value is AssetExtension {
  return assetExtension().safeParse(value).success;
}

/**
 * Safely parse and return an asset extension or throw an error.
 * @param value - The value to parse
 * @returns The validated asset extension
 * @throws {Error} If the value is not a valid asset extension
 * @example
 * ```typescript
 * try {
 *   const ext = getAssetExtension("BURNABLE"); // Returns "BURNABLE" as AssetExtension
 *   const invalid = getAssetExtension("invalid"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid asset extension provided");
 * }
 * ```
 */
export function getAssetExtension(value: unknown): AssetExtension {
  return assetExtension().parse(value);
}

/**
 * Type guard to check if a value is a valid asset extension array.
 * @param value - The value to check
 * @returns `true` if the value is a valid asset extension array, `false` otherwise
 * @example
 * ```typescript
 * if (isAssetExtensionArray(["BURNABLE", "PAUSABLE"])) {
 *   console.log("Valid asset extension array");
 * }
 * ```
 */
export function isAssetExtensionArray(
  value: unknown
): value is AssetExtensionArray {
  return assetExtensionArray().safeParse(value).success;
}

/**
 * Safely parse and return an asset extension array or throw an error.
 * @param value - The value to parse
 * @returns The validated asset extension array
 * @throws {Error} If the value is not a valid asset extension array
 * @example
 * ```typescript
 * const extensions = getAssetExtensionArray(["BURNABLE", "PAUSABLE"]); // Valid
 * const empty = getAssetExtensionArray([]); // Valid - returns empty array
 * ```
 */
export function getAssetExtensionArray(value: unknown): AssetExtensionArray {
  return assetExtensionArray().parse(value);
}

/**
 * Type guard to check if a value is a valid asset extension set.
 * @param value - The value to check
 * @returns `true` if the value is a valid asset extension set, `false` otherwise
 * @example
 * ```typescript
 * const mySet = new Set(["BURNABLE", "PAUSABLE"]);
 * if (isAssetExtensionSet(mySet)) {
 *   console.log("Valid asset extension set");
 * }
 * ```
 */
export function isAssetExtensionSet(
  value: unknown
): value is AssetExtensionSet {
  return assetExtensionSet().safeParse(value).success;
}

/**
 * Safely parse and return an asset extension set or throw an error.
 * @param value - The value to parse
 * @returns The validated asset extension set
 * @throws {Error} If the value is not a valid asset extension set
 * @example
 * ```typescript
 * const extensions = getAssetExtensionSet(new Set(["BURNABLE", "PAUSABLE"])); // Valid
 * const empty = getAssetExtensionSet(new Set()); // Valid - returns empty set
 * ```
 */
export function getAssetExtensionSet(value: unknown): AssetExtensionSet {
  return assetExtensionSet().parse(value);
}
