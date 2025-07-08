import type { AssetType } from "@/lib/zod/validators/asset-types";

/**
 * Get the capitalized form of an asset type
 *
 * This utility function provides consistent capitalization for asset types
 * throughout the application. It handles proper casing for display purposes.
 *
 * @param assetType - The asset type to capitalize
 * @returns The capitalized asset type string
 *
 * @example
 * ```typescript
 * getAssetTypeCapitalized('bond'); // "Bond"
 * getAssetTypeCapitalized('equity'); // "Equity"
 * getAssetTypeCapitalized('stablecoin'); // "Stablecoin"
 * getAssetTypeCapitalized('deposit'); // "Deposit"
 * getAssetTypeCapitalized('fund'); // "Fund"
 * ```
 */
export function getAssetTypeCapitalized(assetType: AssetType): string {
  return assetType.charAt(0).toUpperCase() + assetType.slice(1).toLowerCase();
}

/**
 * Get the capitalized form with "the" article prefixed
 *
 * This is useful for generating user-facing messages that need proper grammar.
 *
 * @param assetType - The asset type to capitalize
 * @returns The capitalized asset type string with "the" prefix
 *
 * @example
 * ```typescript
 * getAssetTypeCapitalizedWithArticle('bond'); // "the Bond"
 * getAssetTypeCapitalizedWithArticle('equity'); // "the Equity"
 * ```
 */
export function getAssetTypeCapitalizedWithArticle(
  assetType: AssetType
): string {
  const capitalized = getAssetTypeCapitalized(assetType);
  return `the ${capitalized}`;
}

/**
 * Get the lowercase form of an asset type
 *
 * This ensures consistent lowercase formatting when needed.
 *
 * @param assetType - The asset type to make lowercase
 * @returns The lowercase asset type string
 *
 * @example
 * ```typescript
 * getAssetTypeLowercase('BOND'); // "bond"
 * getAssetTypeLowercase('Equity'); // "equity"
 * ```
 */
export function getAssetTypeLowercase(assetType: AssetType): string {
  return assetType.toLowerCase();
}
