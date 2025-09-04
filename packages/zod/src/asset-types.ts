/**
 * Asset Type Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating financial asset types,
 * ensuring they match predefined enumerations. It's designed to support the
 * asset tokenization platform's various asset categories.
 * @module AssetTypeValidation
 */
import { z } from "zod";

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

export const assetClasses = [
  "fixedIncome",
  "flexibleIncome",
  "cashEquivalent",
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
 * Tuple of valid asset factory typeId values for type-safe iteration.
 * @remarks
 * This constant defines all supported factory typeIds in the platform:
 * - `ATKBondFactory`: Factory for bond assets
 * - `ATKEquityFactory`: Factory for equity assets
 * - `ATKFundFactory`: Factory for fund assets
 * - `ATKStableCoinFactory`: Factory for stablecoin assets
 * - `ATKDepositFactory`: Factory for deposit assets
 */
export const assetFactoryTypeIds = [
  "ATKBondFactory",
  "ATKEquityFactory",
  "ATKFundFactory",
  "ATKStableCoinFactory",
  "ATKDepositFactory",
] as const;

/**
 * Enum-like object for dot notation access to asset factory typeIds.
 * Provides a convenient way to reference factory typeIds in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (factoryType === AssetFactoryTypeIdEnum.ATKStableCoinFactory) {
 *   console.log("Processing stablecoin factory");
 * }
 *
 * // Use in switch statements
 * switch (factoryTypeId) {
 *   case AssetFactoryTypeIdEnum.ATKBondFactory:
 *     createBondFactory();
 *     break;
 *   case AssetFactoryTypeIdEnum.ATKEquityFactory:
 *     createEquityFactory();
 *     break;
 * }
 * ```
 */
export const AssetFactoryTypeIdEnum = {
  ATKBondFactory: "ATKBondFactory",
  ATKEquityFactory: "ATKEquityFactory",
  ATKFundFactory: "ATKFundFactory",
  ATKStableCoinFactory: "ATKStableCoinFactory",
  ATKDepositFactory: "ATKDepositFactory",
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

export const assetClass = () =>
  z.enum(assetClasses).describe("Class of financial asset");

/**
 * Creates a Zod schema that validates an asset factory typeId.
 * @remarks
 * Features:
 * - Strict enum validation against predefined factory typeIds
 * - Type-safe inference
 * - Descriptive error messages for invalid inputs
 * - Case-sensitive matching (must match exact casing)
 * @returns A Zod enum schema for asset factory typeId validation
 * @example
 * ```typescript
 * const schema = assetFactoryTypeId();
 * schema.parse("ATKBondFactory"); // Returns "ATKBondFactory" as AssetFactoryTypeId
 * schema.parse("invalid"); // Throws ZodError
 *
 * // Use in factory creation
 * const factorySchema = z.object({
 *   typeId: assetFactoryTypeId(),
 *   name: z.string()
 * });
 * ```
 */
export const assetFactoryTypeId = () =>
  z.enum(assetFactoryTypeIds).describe("Asset factory typeId identifier");

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
 * Creates an array validator for multiple asset factory typeIds.
 * Ensures at least one factory typeId is selected.
 * @returns A Zod array schema that validates a list of asset factory typeIds
 * @example
 * ```typescript
 * const schema = assetFactoryTypeIdArray();
 * schema.parse(["ATKBondFactory", "ATKEquityFactory"]); // Valid
 * schema.parse([]); // Invalid - empty array
 * schema.parse(["invalid"]); // Invalid - unknown typeId
 * ```
 */
export const assetFactoryTypeIdArray = () =>
  z
    .array(assetFactoryTypeId())
    .min(1, "At least one factory typeId must be selected")
    .describe("List of asset factory typeIds");

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
 * Creates a set validator for unique asset factory typeIds.
 * Automatically removes duplicates and ensures at least one typeId.
 * @returns A Zod set schema that validates unique asset factory typeIds
 * @example
 * ```typescript
 * const schema = assetFactoryTypeIdSet();
 * schema.parse(new Set(["ATKBondFactory", "ATKEquityFactory"])); // Valid
 * schema.parse(new Set(["ATKBondFactory", "ATKBondFactory"])); // Valid - duplicates removed
 * schema.parse(new Set()); // Invalid - empty set
 * ```
 */
export const assetFactoryTypeIdSet = () =>
  z
    .set(assetFactoryTypeId())
    .min(1, "At least one factory typeId must be selected")
    .describe("Set of unique asset factory typeIds");

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
 * Creates an asset factory typeId validator with an optional default value.
 * Useful for forms where a default selection is needed.
 * @param defaultValue - The default factory typeId (defaults to "ATKBondFactory")
 * @returns A Zod schema with a default value
 * @example
 * ```typescript
 * const schema = assetFactoryTypeIdWithDefault("ATKEquityFactory");
 * schema.parse(undefined); // Returns "ATKEquityFactory"
 * schema.parse("ATKFundFactory"); // Returns "ATKFundFactory"
 * ```
 */
export const assetFactoryTypeIdWithDefault = (
  defaultValue: AssetFactoryTypeId = assetFactoryTypeId().parse(
    "ATKBondFactory"
  )
) => assetFactoryTypeId().default(defaultValue);

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

/**
 * Creates a record validator for asset factory typeId to value mappings.
 * Creates a partial record where not all factory typeIds need to be present.
 * @template T - The Zod type for the values in the record
 * @param valueSchema - The schema to validate each value
 * @returns A Zod object schema with optional fields for each factory typeId
 * @example
 * ```typescript
 * // Create a schema for factory configurations
 * const configSchema = assetFactoryTypeIdRecord(z.object({
 *   enabled: z.boolean(),
 *   maxSupply: z.number()
 * }));
 *
 * // Valid - partial configurations
 * configSchema.parse({
 *   ATKBondFactory: { enabled: true, maxSupply: 1000000 },
 *   ATKEquityFactory: { enabled: false, maxSupply: 500000 }
 * });
 * ```
 */
export const assetFactoryTypeIdRecord = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      ATKBondFactory: valueSchema.optional(),
      ATKEquityFactory: valueSchema.optional(),
      ATKFundFactory: valueSchema.optional(),
      ATKStableCoinFactory: valueSchema.optional(),
      ATKDepositFactory: valueSchema.optional(),
    })
    .strict() // Prevent unknown keys
    .describe("Mapping of asset factory typeIds to values");

// Export types
/**
 * Type representing a validated asset type.
 * Ensures type safety.
 */
export type AssetType = z.infer<ReturnType<typeof assetType>>;

export type AssetClass = z.infer<ReturnType<typeof assetClass>>;

/**
 * Type representing a validated asset factory typeId.
 * Ensures type safety.
 */
export type AssetFactoryTypeId = z.infer<ReturnType<typeof assetFactoryTypeId>>;

/**
 * Type representing an array of validated asset types.
 */
export type AssetTypeArray = z.infer<ReturnType<typeof assetTypeArray>>;

/**
 * Type representing an array of validated asset factory typeIds.
 */
export type AssetFactoryTypeIdArray = z.infer<
  ReturnType<typeof assetFactoryTypeIdArray>
>;

/**
 * Type representing a set of unique validated asset types.
 */
export type AssetTypeSet = z.infer<ReturnType<typeof assetTypeSet>>;

/**
 * Type representing a set of unique validated asset factory typeIds.
 */
export type AssetFactoryTypeIdSet = z.infer<
  ReturnType<typeof assetFactoryTypeIdSet>
>;

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
 * Type guard to check if a value is a valid asset factory typeId.
 * @param value - The value to check
 * @returns `true` if the value is a valid asset factory typeId, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "ATKBondFactory";
 * if (isAssetFactoryTypeId(userInput)) {
 *   // TypeScript knows userInput is AssetFactoryTypeId here
 *   console.log(`Processing ${userInput} factory`);
 * }
 * ```
 */
export function isAssetFactoryTypeId(
  value: unknown
): value is AssetFactoryTypeId {
  return assetFactoryTypeId().safeParse(value).success;
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
 * Safely parse and return an asset factory typeId or throw an error.
 * @param value - The value to parse
 * @returns The validated asset factory typeId
 * @throws {Error} If the value is not a valid asset factory typeId
 * @example
 * ```typescript
 * try {
 *   const typeId = getAssetFactoryTypeId("ATKEquityFactory"); // Returns "ATKEquityFactory" as AssetFactoryTypeId
 *   const invalid = getAssetFactoryTypeId("InvalidFactory"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid asset factory typeId provided");
 * }
 * ```
 */
export function getAssetFactoryTypeId(value: unknown): AssetFactoryTypeId {
  return assetFactoryTypeId().parse(value);
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
 * Type guard to check if a value is a valid asset factory typeId array.
 * @param value - The value to check
 * @returns `true` if the value is a valid asset factory typeId array, `false` otherwise
 * @example
 * ```typescript
 * if (isAssetFactoryTypeIdArray(["ATKBondFactory", "ATKEquityFactory"])) {
 *   console.log("Valid asset factory typeId array");
 * }
 * ```
 */
export function isAssetFactoryTypeIdArray(
  value: unknown
): value is AssetFactoryTypeIdArray {
  return assetFactoryTypeIdArray().safeParse(value).success;
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
 * Safely parse and return an asset factory typeId array or throw an error.
 * @param value - The value to parse
 * @returns The validated asset factory typeId array
 * @throws {Error} If the value is not a valid asset factory typeId array
 * @example
 * ```typescript
 * const typeIds = getAssetFactoryTypeIdArray(["ATKBondFactory", "ATKFundFactory"]); // Valid
 * const empty = getAssetFactoryTypeIdArray([]); // Throws Error - empty array
 * ```
 */
export function getAssetFactoryTypeIdArray(
  value: unknown
): AssetFactoryTypeIdArray {
  return assetFactoryTypeIdArray().parse(value);
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
 * Type guard to check if a value is a valid asset factory typeId set.
 * @param value - The value to check
 * @returns `true` if the value is a valid asset factory typeId set, `false` otherwise
 * @example
 * ```typescript
 * const mySet = new Set(["ATKBondFactory", "ATKEquityFactory"]);
 * if (isAssetFactoryTypeIdSet(mySet)) {
 *   console.log("Valid asset factory typeId set");
 * }
 * ```
 */
export function isAssetFactoryTypeIdSet(
  value: unknown
): value is AssetFactoryTypeIdSet {
  return assetFactoryTypeIdSet().safeParse(value).success;
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

/**
 * Safely parse and return an asset factory typeId set or throw an error.
 * @param value - The value to parse
 * @returns The validated asset factory typeId set
 * @throws {Error} If the value is not a valid asset factory typeId set
 * @example
 * ```typescript
 * const typeIds = getAssetFactoryTypeIdSet(new Set(["ATKBondFactory", "ATKEquityFactory"])); // Valid
 * const empty = getAssetFactoryTypeIdSet(new Set()); // Throws Error - empty set
 * ```
 */
export function getAssetFactoryTypeIdSet(
  value: unknown
): AssetFactoryTypeIdSet {
  return assetFactoryTypeIdSet().parse(value);
}

/**
 * Utility function to map an asset type to its corresponding factory typeId.
 * @param assetType - The asset type to map
 * @returns The corresponding factory typeId
 * @example
 * ```typescript
 * const factoryTypeId = getFactoryTypeIdFromAssetType("bond"); // Returns "ATKBondFactory"
 * const stablecoinFactory = getFactoryTypeIdFromAssetType("stablecoin"); // Returns "ATKStableCoinFactory"
 * ```
 */
export function getFactoryTypeIdFromAssetType(
  assetType: AssetType
): AssetFactoryTypeId {
  const mapping: Record<AssetType, AssetFactoryTypeId> = {
    bond: "ATKBondFactory",
    equity: "ATKEquityFactory",
    fund: "ATKFundFactory",
    stablecoin: "ATKStableCoinFactory",
    deposit: "ATKDepositFactory",
  };

  return mapping[assetType];
}

/**
 * Utility function to map a factory typeId to its corresponding asset type.
 * @param factoryTypeId - The factory typeId to map
 * @returns The corresponding asset type
 * @example
 * ```typescript
 * const assetType = getAssetTypeFromFactoryTypeId("ATKBondFactory"); // Returns "bond"
 * const stablecoinType = getAssetTypeFromFactoryTypeId("ATKStableCoinFactory"); // Returns "stablecoin"
 * ```
 */
export function getAssetTypeFromFactoryTypeId(
  factoryTypeId: AssetFactoryTypeId
): AssetType {
  const mapping: Record<AssetFactoryTypeId, AssetType> = {
    ATKBondFactory: "bond",
    ATKEquityFactory: "equity",
    ATKFundFactory: "fund",
    ATKStableCoinFactory: "stablecoin",
    ATKDepositFactory: "deposit",
  };

  return mapping[factoryTypeId];
}

export function getAssetClassFromFactoryTypeId(
  factoryTypeId: AssetFactoryTypeId
): AssetClass {
  const mapping: Record<AssetFactoryTypeId, AssetClass> = {
    ATKBondFactory: "fixedIncome",
    ATKEquityFactory: "flexibleIncome",
    ATKFundFactory: "flexibleIncome",
    ATKStableCoinFactory: "cashEquivalent",
    ATKDepositFactory: "cashEquivalent",
  };

  return mapping[factoryTypeId];
}
