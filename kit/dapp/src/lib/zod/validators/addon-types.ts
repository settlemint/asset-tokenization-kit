/**
 * Addon Type Validation Utilities
 *
 * This module provides comprehensive Zod schemas for validating system addon types,
 * ensuring they match predefined enumerations. It's designed to support the
 * asset tokenization platform's various addon categories for airdrops, yield, and XvP.
 * @module AddonTypeValidation
 */
import { z } from "zod";

/**
 * Tuple of valid addon types for type-safe iteration.
 * @remarks
 * This constant defines all supported addon types in the platform:
 * - `airdrops`: Airdrop distribution addons
 * - `yield`: Yield distribution addons
 * - `xvp`: XvP (Cross-value Protocol) settlement addons
 */
export const addonTypes = ["airdrops", "yield", "xvp"] as const;

/**
 * Tuple of valid addon categories for type-safe iteration.
 * @remarks
 * This constant defines all supported addon categories in the platform:
 * - `distribution`: Addons for distributing tokens (airdrops, primary offerings)
 * - `exchange`: Addons for exchanging value (XvP)
 * - `custody`: Addons for custody solutions (vaults)
 * - `income`: Addons for income generation (yield, dividends)
 */
export const addonCategories = [
  "distribution",
  "exchange",
  "custody",
  "income",
] as const;

/**
 * Enum-like object for dot notation access to addon types.
 * Provides a convenient way to reference addon types in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (userAddon === AddonTypeEnum.airdrops) {
 *   console.log("Processing airdrop addon");
 * }
 *
 * // Use in switch statements
 * switch (addonType) {
 *   case AddonTypeEnum.airdrops:
 *     processAirdrop();
 *     break;
 *   case AddonTypeEnum.yield:
 *     processYield();
 *     break;
 * }
 * ```
 */
export const AddonTypeEnum = {
  airdrops: "airdrops",
  yield: "yield",
  xvp: "xvp",
} as const;

/**
 * Enum-like object for dot notation access to addon categories.
 * Provides a convenient way to reference addon categories in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (category === AddonCategoryEnum.distribution) {
 *   console.log("Processing distribution addons");
 * }
 * ```
 */
export const AddonCategoryEnum = {
  distribution: "distribution",
  exchange: "exchange",
  custody: "custody",
  income: "income",
} as const;

/**
 * Tuple of valid addon factory typeId values for type-safe iteration.
 * @remarks
 * This constant defines all supported factory typeIds in the platform:
 * - `ATKPushAirdropFactory`: Factory for push airdrops
 * - `ATKVestingAirdropFactory`: Factory for vesting airdrops
 * - `ATKTimeBoundAirdropFactory`: Factory for time-bound airdrops
 * - `ATKFixedYieldScheduleFactory`: Factory for fixed yield schedules
 * - `ATKXvPSettlementFactory`: Factory for XvP settlements
 * - `ATKVaultFactory`: Factory for vaults
 * - `unknown`: For unrecognized addon types (legacy support)
 */
export const addonFactoryTypeIds = [
  "ATKPushAirdropFactory",
  "ATKVestingAirdropFactory",
  "ATKTimeBoundAirdropFactory",
  "ATKFixedYieldScheduleFactory",
  "ATKXvPSettlementFactory",
  "ATKVaultFactory",
  "unknown",
] as const;

/**
 * Enum-like object for dot notation access to addon factory typeIds.
 * Provides a convenient way to reference factory typeIds in code.
 * @example
 * ```typescript
 * // Use for comparisons and assignments
 * if (factoryType === AddonFactoryTypeIdEnum.ATKPushAirdropFactory) {
 *   console.log("Processing push airdrop factory");
 * }
 *
 * // Use in switch statements
 * switch (factoryTypeId) {
 *   case AddonFactoryTypeIdEnum.ATKVestingAirdropFactory:
 *     createVestingAirdropFactory();
 *     break;
 *   case AddonFactoryTypeIdEnum.ATKFixedYieldScheduleFactory:
 *     createYieldFactory();
 *     break;
 * }
 * ```
 */
export const AddonFactoryTypeIdEnum = {
  ATKPushAirdropFactory: "ATKPushAirdropFactory",
  ATKVestingAirdropFactory: "ATKVestingAirdropFactory",
  ATKTimeBoundAirdropFactory: "ATKTimeBoundAirdropFactory",
  ATKFixedYieldScheduleFactory: "ATKFixedYieldScheduleFactory",
  ATKXvPSettlementFactory: "ATKXvPSettlementFactory",
  ATKVaultFactory: "ATKVaultFactory",
  unknown: "unknown",
} as const;

/**
 * Creates a Zod schema that validates an addon type.
 * @remarks
 * Features:
 * - Strict enum validation against predefined addon types
 * - Type-safe inference
 * - Descriptive error messages for invalid inputs
 * - Case-sensitive matching (must be lowercase)
 * @returns A Zod enum schema for addon type validation
 * @example
 * ```typescript
 * const schema = addonType();
 * schema.parse("airdrops"); // Returns "airdrops" as AddonType
 * schema.parse("invalid"); // Throws ZodError
 *
 * // Use in form validation
 * const formSchema = z.object({
 *   type: addonType(),
 *   enabled: z.boolean()
 * });
 * ```
 */
export const addonType = () =>
  z.enum(addonTypes).describe("Type of system addon");

/**
 * Creates a Zod schema that validates an addon category.
 * @remarks
 * Features:
 * - Strict enum validation against predefined addon categories
 * - Type-safe inference
 * - Descriptive error messages for invalid inputs
 * - Case-sensitive matching (must be lowercase)
 * @returns A Zod enum schema for addon category validation
 * @example
 * ```typescript
 * const schema = addonCategory();
 * schema.parse("distribution"); // Returns "distribution" as AddonCategory
 * schema.parse("invalid"); // Throws ZodError
 * ```
 */
export const addonCategory = () =>
  z.enum(addonCategories).describe("Category of system addon");

/**
 * Creates a Zod schema that validates an addon factory typeId.
 * @remarks
 * Features:
 * - Strict enum validation against predefined factory typeIds
 * - Type-safe inference
 * - Descriptive error messages for invalid inputs
 * - Case-sensitive matching (must match exact casing)
 * - Includes "unknown" for legacy support
 * @returns A Zod enum schema for addon factory typeId validation
 * @example
 * ```typescript
 * const schema = addonFactoryTypeId();
 * schema.parse("ATKPushAirdropFactory"); // Returns "ATKPushAirdropFactory" as AddonFactoryTypeId
 * schema.parse("invalid"); // Throws ZodError
 *
 * // Use in factory creation
 * const factorySchema = z.object({
 *   typeId: addonFactoryTypeId(),
 *   name: z.string()
 * });
 * ```
 */
export const addonFactoryTypeId = () =>
  z.enum(addonFactoryTypeIds).describe("Addon factory typeId identifier");

/**
 * Creates an array validator for multiple addon types.
 * Ensures at least one addon type is selected.
 * @returns A Zod array schema that validates a list of addon types
 * @example
 * ```typescript
 * const schema = addonTypeArray();
 * schema.parse(["airdrops", "yield"]); // Valid
 * schema.parse([]); // Invalid - empty array
 * schema.parse(["invalid"]); // Invalid - unknown type
 * ```
 */
export const addonTypeArray = () =>
  z
    .array(addonType())
    .min(1, "At least one addon type must be selected")
    .describe("List of addon types");

/**
 * Creates an array validator for multiple addon factory typeIds.
 * Ensures at least one factory typeId is selected.
 * @returns A Zod array schema that validates a list of addon factory typeIds
 * @example
 * ```typescript
 * const schema = addonFactoryTypeIdArray();
 * schema.parse(["ATKPushAirdropFactory", "ATKVestingAirdropFactory"]); // Valid
 * schema.parse([]); // Invalid - empty array
 * schema.parse(["invalid"]); // Invalid - unknown typeId
 * ```
 */
export const addonFactoryTypeIdArray = () =>
  z
    .array(addonFactoryTypeId())
    .min(1, "At least one factory typeId must be selected")
    .describe("List of addon factory typeIds");

/**
 * Creates a set validator for unique addon types.
 * Automatically removes duplicates and ensures at least one type.
 * @returns A Zod set schema that validates unique addon types
 * @example
 * ```typescript
 * const schema = addonTypeSet();
 * schema.parse(new Set(["airdrops", "yield"])); // Valid
 * schema.parse(new Set(["airdrops", "airdrops"])); // Valid - duplicates removed
 * schema.parse(new Set()); // Invalid - empty set
 * ```
 */
export const addonTypeSet = () =>
  z
    .set(addonType())
    .min(1, "At least one addon type must be selected")
    .describe("Set of unique addon types");

/**
 * Creates a set validator for unique addon factory typeIds.
 * Automatically removes duplicates and ensures at least one typeId.
 * @returns A Zod set schema that validates unique addon factory typeIds
 * @example
 * ```typescript
 * const schema = addonFactoryTypeIdSet();
 * schema.parse(new Set(["ATKPushAirdropFactory", "ATKVestingAirdropFactory"])); // Valid
 * schema.parse(new Set(["ATKPushAirdropFactory", "ATKPushAirdropFactory"])); // Valid - duplicates removed
 * schema.parse(new Set()); // Invalid - empty set
 * ```
 */
export const addonFactoryTypeIdSet = () =>
  z
    .set(addonFactoryTypeId())
    .min(1, "At least one factory typeId must be selected")
    .describe("Set of unique addon factory typeIds");

/**
 * Creates an addon type validator with an optional default value.
 * Useful for forms where a default selection is needed.
 * @param defaultValue - The default addon type (defaults to "airdrops")
 * @returns A Zod schema with a default value
 * @example
 * ```typescript
 * const schema = addonTypeWithDefault("yield");
 * schema.parse(undefined); // Returns "yield"
 * schema.parse("xvp"); // Returns "xvp"
 * ```
 */
export const addonTypeWithDefault = (
  defaultValue: AddonType = addonType().parse("airdrops")
) => addonType().default(defaultValue);

/**
 * Creates an addon factory typeId validator with an optional default value.
 * Useful for forms where a default selection is needed.
 * @param defaultValue - The default factory typeId (defaults to "ATKPushAirdropFactory")
 * @returns A Zod schema with a default value
 * @example
 * ```typescript
 * const schema = addonFactoryTypeIdWithDefault("ATKVestingAirdropFactory");
 * schema.parse(undefined); // Returns "ATKVestingAirdropFactory"
 * schema.parse("ATKXvPSettlementFactory"); // Returns "ATKXvPSettlementFactory"
 * ```
 */
export const addonFactoryTypeIdWithDefault = (
  defaultValue: AddonFactoryTypeId = addonFactoryTypeId().parse(
    "ATKPushAirdropFactory"
  )
) => addonFactoryTypeId().default(defaultValue);

/**
 * Creates a record validator for addon type to value mappings.
 * Creates a partial record where not all addon types need to be present.
 * @template T - The Zod type for the values in the record
 * @param valueSchema - The schema to validate each value
 * @returns A Zod object schema with optional fields for each addon type
 * @example
 * ```typescript
 * // Create a schema for addon configurations
 * const configSchema = addonTypeRecord(z.object({
 *   enabled: z.boolean(),
 *   maxCount: z.number()
 * }));
 *
 * // Valid - partial configurations
 * configSchema.parse({
 *   airdrops: { enabled: true, maxCount: 100 },
 *   yield: { enabled: false, maxCount: 0 }
 * });
 * ```
 */
export const addonTypeRecord = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      airdrops: valueSchema.optional(),
      yield: valueSchema.optional(),
      xvp: valueSchema.optional(),
    })
    .strict() // Prevent unknown keys
    .describe("Mapping of addon types to values");

/**
 * Creates a record validator for addon factory typeId to value mappings.
 * Creates a partial record where not all factory typeIds need to be present.
 * @template T - The Zod type for the values in the record
 * @param valueSchema - The schema to validate each value
 * @returns A Zod object schema with optional fields for each factory typeId
 * @example
 * ```typescript
 * // Create a schema for factory configurations
 * const configSchema = addonFactoryTypeIdRecord(z.object({
 *   enabled: z.boolean(),
 *   maxSupply: z.number()
 * }));
 *
 * // Valid - partial configurations
 * configSchema.parse({
 *   ATKPushAirdropFactory: { enabled: true, maxSupply: 1000 },
 *   ATKVestingAirdropFactory: { enabled: false, maxSupply: 500 }
 * });
 * ```
 */
export const addonFactoryTypeIdRecord = <T extends z.ZodType>(valueSchema: T) =>
  z
    .object({
      ATKPushAirdropFactory: valueSchema.optional(),
      ATKVestingAirdropFactory: valueSchema.optional(),
      ATKTimeBoundAirdropFactory: valueSchema.optional(),
      ATKFixedYieldScheduleFactory: valueSchema.optional(),
      ATKXvPSettlementFactory: valueSchema.optional(),
      ATKVaultFactory: valueSchema.optional(),
      unknown: valueSchema.optional(),
    })
    .strict() // Prevent unknown keys
    .describe("Mapping of addon factory typeIds to values");

// Export types
/**
 * Type representing a validated addon type.
 * Ensures type safety.
 */
export type AddonType = z.infer<ReturnType<typeof addonType>>;

/**
 * Type representing a validated addon category.
 * Ensures type safety.
 */
export type AddonCategory = z.infer<ReturnType<typeof addonCategory>>;

/**
 * Type representing a validated addon factory typeId.
 * Ensures type safety.
 */
export type AddonFactoryTypeId = z.infer<ReturnType<typeof addonFactoryTypeId>>;

/**
 * Type representing an array of validated addon types.
 */
export type AddonTypeArray = z.infer<ReturnType<typeof addonTypeArray>>;

/**
 * Type representing an array of validated addon factory typeIds.
 */
export type AddonFactoryTypeIdArray = z.infer<
  ReturnType<typeof addonFactoryTypeIdArray>
>;

/**
 * Type representing a set of unique validated addon types.
 */
export type AddonTypeSet = z.infer<ReturnType<typeof addonTypeSet>>;

/**
 * Type representing a set of unique validated addon factory typeIds.
 */
export type AddonFactoryTypeIdSet = z.infer<
  ReturnType<typeof addonFactoryTypeIdSet>
>;

/**
 * Type guard to check if a value is a valid addon type.
 * @param value - The value to check
 * @returns `true` if the value is a valid addon type, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "airdrops";
 * if (isAddonType(userInput)) {
 *   // TypeScript knows userInput is AddonType here
 *   console.log(`Processing ${userInput} addon`);
 * }
 * ```
 */
export function isAddonType(value: unknown): value is AddonType {
  return addonType().safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid addon factory typeId.
 * @param value - The value to check
 * @returns `true` if the value is a valid addon factory typeId, `false` otherwise
 * @example
 * ```typescript
 * const userInput: unknown = "ATKPushAirdropFactory";
 * if (isAddonFactoryTypeId(userInput)) {
 *   // TypeScript knows userInput is AddonFactoryTypeId here
 *   console.log(`Processing ${userInput} factory`);
 * }
 * ```
 */
export function isAddonFactoryTypeId(
  value: unknown
): value is AddonFactoryTypeId {
  return addonFactoryTypeId().safeParse(value).success;
}

/**
 * Safely parse and return an addon type or throw an error.
 * @param value - The value to parse
 * @returns The validated addon type
 * @throws {Error} If the value is not a valid addon type
 * @example
 * ```typescript
 * try {
 *   const type = getAddonType("yield"); // Returns "yield" as AddonType
 *   const invalid = getAddonType("mining"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid addon type provided");
 * }
 * ```
 */
export function getAddonType(value: unknown): AddonType {
  return addonType().parse(value);
}

/**
 * Safely parse and return an addon factory typeId or throw an error.
 * @param value - The value to parse
 * @returns The validated addon factory typeId
 * @throws {Error} If the value is not a valid addon factory typeId
 * @example
 * ```typescript
 * try {
 *   const typeId = getAddonFactoryTypeId("ATKVestingAirdropFactory"); // Returns "ATKVestingAirdropFactory" as AddonFactoryTypeId
 *   const invalid = getAddonFactoryTypeId("InvalidFactory"); // Throws Error
 * } catch (error) {
 *   console.error("Invalid addon factory typeId provided");
 * }
 * ```
 */
export function getAddonFactoryTypeId(value: unknown): AddonFactoryTypeId {
  return addonFactoryTypeId().parse(value);
}

/**
 * Type guard to check if a value is a valid addon type array.
 * @param value - The value to check
 * @returns `true` if the value is a valid addon type array, `false` otherwise
 * @example
 * ```typescript
 * if (isAddonTypeArray(["airdrops", "yield"])) {
 *   console.log("Valid addon type array");
 * }
 * ```
 */
export function isAddonTypeArray(value: unknown): value is AddonTypeArray {
  return addonTypeArray().safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid addon factory typeId array.
 * @param value - The value to check
 * @returns `true` if the value is a valid addon factory typeId array, `false` otherwise
 * @example
 * ```typescript
 * if (isAddonFactoryTypeIdArray(["ATKPushAirdropFactory", "ATKVestingAirdropFactory"])) {
 *   console.log("Valid addon factory typeId array");
 * }
 * ```
 */
export function isAddonFactoryTypeIdArray(
  value: unknown
): value is AddonFactoryTypeIdArray {
  return addonFactoryTypeIdArray().safeParse(value).success;
}

/**
 * Safely parse and return an addon type array or throw an error.
 * @param value - The value to parse
 * @returns The validated addon type array
 * @throws {Error} If the value is not a valid addon type array
 * @example
 * ```typescript
 * const types = getAddonTypeArray(["airdrops", "xvp"]); // Valid
 * const empty = getAddonTypeArray([]); // Throws Error - empty array
 * ```
 */
export function getAddonTypeArray(value: unknown): AddonTypeArray {
  return addonTypeArray().parse(value);
}

/**
 * Safely parse and return an addon factory typeId array or throw an error.
 * @param value - The value to parse
 * @returns The validated addon factory typeId array
 * @throws {Error} If the value is not a valid addon factory typeId array
 * @example
 * ```typescript
 * const typeIds = getAddonFactoryTypeIdArray(["ATKPushAirdropFactory", "ATKXvPSettlementFactory"]); // Valid
 * const empty = getAddonFactoryTypeIdArray([]); // Throws Error - empty array
 * ```
 */
export function getAddonFactoryTypeIdArray(
  value: unknown
): AddonFactoryTypeIdArray {
  return addonFactoryTypeIdArray().parse(value);
}

/**
 * Type guard to check if a value is a valid addon type set.
 * @param value - The value to check
 * @returns `true` if the value is a valid addon type set, `false` otherwise
 * @example
 * ```typescript
 * const mySet = new Set(["airdrops", "yield"]);
 * if (isAddonTypeSet(mySet)) {
 *   console.log("Valid addon type set");
 * }
 * ```
 */
export function isAddonTypeSet(value: unknown): value is AddonTypeSet {
  return addonTypeSet().safeParse(value).success;
}

/**
 * Type guard to check if a value is a valid addon factory typeId set.
 * @param value - The value to check
 * @returns `true` if the value is a valid addon factory typeId set, `false` otherwise
 * @example
 * ```typescript
 * const mySet = new Set(["ATKPushAirdropFactory", "ATKVestingAirdropFactory"]);
 * if (isAddonFactoryTypeIdSet(mySet)) {
 *   console.log("Valid addon factory typeId set");
 * }
 * ```
 */
export function isAddonFactoryTypeIdSet(
  value: unknown
): value is AddonFactoryTypeIdSet {
  return addonFactoryTypeIdSet().safeParse(value).success;
}

/**
 * Safely parse and return an addon type set or throw an error.
 * @param value - The value to parse
 * @returns The validated addon type set
 * @throws {Error} If the value is not a valid addon type set
 * @example
 * ```typescript
 * const types = getAddonTypeSet(new Set(["airdrops", "yield"])); // Valid
 * const empty = getAddonTypeSet(new Set()); // Throws Error - empty set
 * ```
 */
export function getAddonTypeSet(value: unknown): AddonTypeSet {
  return addonTypeSet().parse(value);
}

/**
 * Safely parse and return an addon factory typeId set or throw an error.
 * @param value - The value to parse
 * @returns The validated addon factory typeId set
 * @throws {Error} If the value is not a valid addon factory typeId set
 * @example
 * ```typescript
 * const typeIds = getAddonFactoryTypeIdSet(new Set(["ATKPushAirdropFactory", "ATKVestingAirdropFactory"])); // Valid
 * const empty = getAddonFactoryTypeIdSet(new Set()); // Throws Error - empty set
 * ```
 */
export function getAddonFactoryTypeIdSet(
  value: unknown
): AddonFactoryTypeIdSet {
  return addonFactoryTypeIdSet().parse(value);
}

/**
 * Utility function to map an addon type to its corresponding factory typeIds.
 * Note: Some addon types can have multiple factory implementations.
 * @param addonType - The addon type to map
 * @returns An array of corresponding factory typeIds
 * @example
 * ```typescript
 * const factoryTypeIds = getFactoryTypeIdsFromAddonType("airdrops");
 * // Returns ["ATKPushAirdropFactory", "ATKVestingAirdropFactory", "ATKTimeBoundAirdropFactory"]
 * ```
 */
export function getFactoryTypeIdsFromAddonType(
  addonType: AddonType
): AddonFactoryTypeId[] {
  const mapping: Record<AddonType, AddonFactoryTypeId[]> = {
    airdrops: [
      "ATKPushAirdropFactory",
      "ATKVestingAirdropFactory",
      "ATKTimeBoundAirdropFactory",
    ],
    yield: ["ATKFixedYieldScheduleFactory"],
    xvp: ["ATKXvPSettlementFactory"],
  };

  return mapping[addonType];
}

/**
 * Utility function to map a factory typeId to its corresponding addon type.
 * @param factoryTypeId - The factory typeId to map
 * @returns The corresponding addon type, or undefined for unknown types
 * @example
 * ```typescript
 * const addonType = getAddonTypeFromFactoryTypeId("ATKPushAirdropFactory"); // Returns "airdrops"
 * const yieldType = getAddonTypeFromFactoryTypeId("ATKFixedYieldScheduleFactory"); // Returns "yield"
 * const unknown = getAddonTypeFromFactoryTypeId("unknown"); // Returns undefined
 * ```
 */
export function getAddonTypeFromFactoryTypeId(
  factoryTypeId: AddonFactoryTypeId
): AddonType | undefined {
  const mapping: Record<AddonFactoryTypeId, AddonType | undefined> = {
    ATKPushAirdropFactory: "airdrops",
    ATKVestingAirdropFactory: "airdrops",
    ATKTimeBoundAirdropFactory: "airdrops",
    ATKFixedYieldScheduleFactory: "yield",
    ATKXvPSettlementFactory: "xvp",
    ATKVaultFactory: undefined, // Vault is not mapped to a specific addon type
    unknown: undefined,
  };

  return mapping[factoryTypeId];
}

/**
 * Utility function to map a factory typeId to its corresponding addon category.
 * @param factoryTypeId - The factory typeId to map
 * @returns The corresponding addon category
 * @example
 * ```typescript
 * const category = getAddonCategoryFromFactoryTypeId("ATKPushAirdropFactory"); // Returns "distribution"
 * const income = getAddonCategoryFromFactoryTypeId("ATKFixedYieldScheduleFactory"); // Returns "income"
 * ```
 */
export function getAddonCategoryFromFactoryTypeId(
  factoryTypeId: AddonFactoryTypeId
): AddonCategory {
  const mapping: Record<AddonFactoryTypeId, AddonCategory> = {
    ATKPushAirdropFactory: "distribution",
    ATKVestingAirdropFactory: "distribution",
    ATKTimeBoundAirdropFactory: "distribution",
    ATKFixedYieldScheduleFactory: "income",
    ATKXvPSettlementFactory: "exchange",
    ATKVaultFactory: "custody",
    unknown: "distribution", // Default to distribution for unknown
  };

  return mapping[factoryTypeId];
}

/**
 * Utility function to map an addon type to its corresponding category.
 * @param addonType - The addon type to map
 * @returns The corresponding addon category
 * @example
 * ```typescript
 * const category = getAddonCategoryFromType("airdrops"); // Returns "distribution"
 * const income = getAddonCategoryFromType("yield"); // Returns "income"
 * ```
 */
export function getAddonCategoryFromType(addonType: AddonType): AddonCategory {
  const mapping: Record<AddonType, AddonCategory> = {
    airdrops: "distribution",
    yield: "income",
    xvp: "exchange",
  };

  return mapping[addonType];
}
