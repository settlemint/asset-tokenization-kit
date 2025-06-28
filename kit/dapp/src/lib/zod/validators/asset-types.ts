/**
 * Asset Type Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating financial asset types,
 * ensuring they match predefined enumerations. It's designed to support the
 * asset tokenization platform's various asset categories.
 * @module AssetTypeValidation
 */
import { z } from "zod/v4";

/**
 * Tuple of valid asset types for type-safe iteration.
 * @remarks
 * This constant defines all supported asset types in the platform:
 * - `bond`: Fixed-income debt securities
 * - `equity`: Ownership shares in companies
 * - `fund`: Pooled investment vehicles
 * - `stablecoin`: Cryptocurrency with stable value
 * - `deposit`: Bank deposit certificates or similar instruments
 */
export const assetTypes = [
  "bond",
  "equity",
  "fund",
  "stablecoin",
  "deposit",
] as const;

/**
 * Enum-like object for dot notation access to asset types.
 * Provides a convenient way to reference asset types in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (userAsset === AssetTypeEnum.stablecoin) {
 *   console.log("Processing stablecoin");
 * }
 *
 * // Use in switch statements
 * switch (assetType) {
 *   case AssetTypeEnum.bond:
 *     processBond();
 *     break;
 *   case AssetTypeEnum.equity:
 *     processEquity();
 *     break;
 * }
 * ```
 */
export const AssetTypeEnum = {
  bond: "bond",
  equity: "equity",
  fund: "fund",
  stablecoin: "stablecoin",
  deposit: "deposit",
} as const;

/**
 * Creates a Zod schema that validates an asset type.
 * @remarks
 * Features:
 * - Strict enum validation against predefined asset types
 * - Type-safe inference
 * - Descriptive error messages for invalid inputs
 * - Case-sensitive matching (must be lowercase)
 * @returns A Zod enum schema for asset type validation
 * @example
 * ```typescript
 * const schema = assetType();
 * schema.parse("bond"); // Returns "bond" as AssetType
 * schema.parse("invalid"); // Throws ZodError
 *
 * // Use in form validation
 * const formSchema = z.object({
 *   type: assetType(),
 *   amount: z.number()
 * });
 * ```
 */
export const assetType = () =>
  z.enum(assetTypes).describe("Type of financial asset");

/**
 * Creates an array validator for multiple asset types.
 * Ensures at least one asset type is selected.
 * @returns A Zod array schema that validates a list of asset types
 * @example
 * ```typescript
 * const schema = assetTypeArray();
 * schema.parse(["bond", "equity"]); // Valid
 * schema.parse([]); // Invalid - empty array
 * schema.parse(["invalid"]); // Invalid - unknown type
 * ```
 */
export const assetTypeArray = () =>
  z
    .array(assetType())
    .min(1, "At least one asset type must be selected")
    .describe("List of asset types");

/**
 * Creates a set validator for unique asset types.
 * Automatically removes duplicates and ensures at least one type.
 * @returns A Zod set schema that validates unique asset types
 * @example
 * ```typescript
 * const schema = assetTypeSet();
 * schema.parse(new Set(["bond", "equity"])); // Valid
 * schema.parse(new Set(["bond", "bond"])); // Valid - duplicates removed
 * schema.parse(new Set()); // Invalid - empty set
 * ```
 */
export const assetTypeSet = () =>
  z
    .set(assetType())
    .min(1, "At least one asset type must be selected")
    .describe("Set of unique asset types");

/**
 * Creates an asset type validator with an optional default value.
 * Useful for forms where a default selection is needed.
 * @param defaultValue - The default asset type (defaults to "bond")
 * @returns A Zod schema with a default value
 * @example
 * ```typescript
 * const schema = assetTypeWithDefault("equity");
 * schema.parse(undefined); // Returns "equity"
 * schema.parse("fund"); // Returns "fund"
 * ```
 */
export const assetTypeWithDefault = (
  defaultValue: AssetType = assetType().parse("bond")
) => assetType().default(defaultValue);

/**
 * Creates a record validator for asset type to value mappings.
 * Creates a partial record where not all asset types need to be present.
 * @template T - The Zod type for the values in the record
 * @param valueSchema - The schema to validate each value
 * @returns A Zod object schema with optional fields for each asset type
 * @example
 * ```typescript
 * // Create a schema for asset allocations
 * const allocationSchema = assetTypeRecord(z.number().min(0).max(100));
 *
 * // Valid - partial allocations
 * allocationSchema.parse({
 *   bond: 40,
 *   equity: 60
 * });
 *
 * // Invalid - negative allocation
 * allocationSchema.parse({
 *   bond: -10
 * });
 * ```
 */
export const assetTypeRecord = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      bond: valueSchema.optional(),
      equity: valueSchema.optional(),
      fund: valueSchema.optional(),
      stablecoin: valueSchema.optional(),
      deposit: valueSchema.optional(),
    })
    .strict() // Prevent unknown keys
    .describe("Mapping of asset types to values");

// Export types
/**
 * Type representing a validated asset type.
 * Ensures type safety.
 */
export type AssetType = z.infer<ReturnType<typeof assetType>>;

/**
 * Type representing an array of validated asset types.
 */
export type AssetTypeArray = z.infer<ReturnType<typeof assetTypeArray>>;

/**
 * Type representing a set of unique validated asset types.
 */
export type AssetTypeSet = z.infer<ReturnType<typeof assetTypeSet>>;

/**
 * Type guard to check if a value is a valid asset type.
 * @param value - The value to check
 * @returns `true` if the value is a valid asset type, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "bond";
 * if (isAssetType(userInput)) {
 *   // TypeScript knows userInput is AssetType here
 *   console.log(`Processing ${userInput} asset`);
 * }
 * ```
 */
export function isAssetType(value: unknown): value is AssetType {
  return assetType().safeParse(value).success;
}

/**
 * Safely parse and return an asset type or throw an error.
 * @param value - The value to parse
 * @returns The validated asset type
 * @throws {Error} If the value is not a valid asset type
 * @example
 * ```typescript
 * try {
 *   const type = getAssetType("equity"); // Returns "equity" as AssetType
 *   const invalid = getAssetType("stocks"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid asset type provided");
 * }
 * ```
 */
export function getAssetType(value: unknown): AssetType {
  return assetType().parse(value);
}

/**
 * Type guard to check if a value is a valid asset type array.
 * @param value - The value to check
 * @returns `true` if the value is a valid asset type array, `false` otherwise
 * @example
 * ```typescript
 * if (isAssetTypeArray(["bond", "equity"])) {
 *   console.log("Valid asset type array");
 * }
 * ```
 */
export function isAssetTypeArray(value: unknown): value is AssetTypeArray {
  return assetTypeArray().safeParse(value).success;
}

/**
 * Safely parse and return an asset type array or throw an error.
 * @param value - The value to parse
 * @returns The validated asset type array
 * @throws {Error} If the value is not a valid asset type array
 * @example
 * ```typescript
 * const types = getAssetTypeArray(["bond", "fund"]); // Valid
 * const empty = getAssetTypeArray([]); // Throws Error - empty array
 * ```
 */
export function getAssetTypeArray(value: unknown): AssetTypeArray {
  return assetTypeArray().parse(value);
}

/**
 * Type guard to check if a value is a valid asset type set.
 * @param value - The value to check
 * @returns `true` if the value is a valid asset type set, `false` otherwise
 * @example
 * ```typescript
 * const mySet = new Set(["bond", "equity"]);
 * if (isAssetTypeSet(mySet)) {
 *   console.log("Valid asset type set");
 * }
 * ```
 */
export function isAssetTypeSet(value: unknown): value is AssetTypeSet {
  return assetTypeSet().safeParse(value).success;
}

/**
 * Safely parse and return an asset type set or throw an error.
 * @param value - The value to parse
 * @returns The validated asset type set
 * @throws {Error} If the value is not a valid asset type set
 * @example
 * ```typescript
 * const types = getAssetTypeSet(new Set(["bond", "equity"])); // Valid
 * const empty = getAssetTypeSet(new Set()); // Throws Error - empty set
 * ```
 */
export function getAssetTypeSet(value: unknown): AssetTypeSet {
  return assetTypeSet().parse(value);
}
