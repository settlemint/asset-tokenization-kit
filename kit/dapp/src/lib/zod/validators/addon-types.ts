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
