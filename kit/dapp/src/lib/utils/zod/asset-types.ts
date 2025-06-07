/**
 * Zod validators for asset types
 *
 * This module provides Zod schemas for validating asset types,
 * ensuring they match predefined enumerations.
 */
import { z } from "zod";

/**
 * Tuple of valid asset types for type-safe iteration
 */
export const assetTypes = [
  "bond",
  "cryptocurrency",
  "equity",
  "fund",
  "stablecoin",
  "deposit",
] as const;

/**
 * Enum-like object for dot notation access to asset types
 * @example
 * AssetTypeEnum.stablecoin // "stablecoin"
 * AssetTypeEnum.bond // "bond"
 */
export const AssetTypeEnum = {
  bond: "bond",
  cryptocurrency: "cryptocurrency",
  equity: "equity",
  fund: "fund",
  stablecoin: "stablecoin",
  deposit: "deposit",
} as const;

/**
 * Validates an asset type
 *
 * Features:
 * - Strict enum validation
 * - Type-safe inference
 * - Descriptive error messages
 * - Case-sensitive matching
 *
 * @example
 * assetType().parse("bond") // "bond"
 * assetType().parse("invalid") // throws error
 */
export const assetType = () =>
  z.enum(assetTypes).describe("Type of financial asset").brand<"AssetType">();

/**
 * Array validator for multiple asset types
 */
export const assetTypeArray = () =>
  z
    .array(assetType())
    .min(1, "At least one asset type must be selected")
    .describe("List of asset types");

/**
 * Set validator for unique asset types
 */
export const assetTypeSet = () =>
  z
    .set(assetType())
    .min(1, "At least one asset type must be selected")
    .describe("Set of unique asset types");

/**
 * Validates asset type with optional default value
 */
export const assetTypeWithDefault = (
  defaultValue: AssetType = assetType().parse("bond")
) => assetType().default(defaultValue);

/**
 * Record validator for asset type to value mappings
 * Note: This creates a partial record - not all asset types need to be present
 */
export const assetTypeRecord = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      bond: valueSchema.optional(),
      cryptocurrency: valueSchema.optional(),
      equity: valueSchema.optional(),
      fund: valueSchema.optional(),
      stablecoin: valueSchema.optional(),
      deposit: valueSchema.optional(),
    })
    .strict()
    .describe("Mapping of asset types to values");

// Export types
export type AssetType = z.infer<ReturnType<typeof assetType>>;
export type AssetTypeArray = z.infer<ReturnType<typeof assetTypeArray>>;
export type AssetTypeSet = z.infer<ReturnType<typeof assetTypeSet>>;

/**
 * Type guard to check if a value is a valid asset type
 * @param value - The value to check
 * @returns true if the value is a valid asset type
 */
export function isAssetType(value: unknown): value is AssetType {
  return assetType().safeParse(value).success;
}

/**
 * Safely parse and return an asset type or throw an error
 * @param value - The value to parse
 * @returns The asset type if valid, throws when not
 */
export function getAssetType(value: unknown): AssetType {
  if (!isAssetType(value)) {
    throw new Error(`Invalid asset type: ${value}`);
  }
  return value;
}

/**
 * Type guard to check if a value is a valid asset type array
 * @param value - The value to check
 * @returns true if the value is a valid asset type array
 */
export function isAssetTypeArray(value: unknown): value is AssetTypeArray {
  return assetTypeArray().safeParse(value).success;
}

/**
 * Safely parse and return an asset type array or throw an error
 * @param value - The value to parse
 * @returns The asset type array if valid, throws when not
 */
export function getAssetTypeArray(value: unknown): AssetTypeArray {
  const result = assetTypeArray().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid asset type array: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Type guard to check if a value is a valid asset type set
 * @param value - The value to check
 * @returns true if the value is a valid asset type set
 */
export function isAssetTypeSet(value: unknown): value is AssetTypeSet {
  return assetTypeSet().safeParse(value).success;
}

/**
 * Safely parse and return an asset type set or throw an error
 * @param value - The value to parse
 * @returns The asset type set if valid, throws when not
 */
export function getAssetTypeSet(value: unknown): AssetTypeSet {
  const result = assetTypeSet().safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid asset type set: ${result.error.message}`);
  }
  return result.data;
}
