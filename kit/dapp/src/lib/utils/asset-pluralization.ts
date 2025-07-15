import { useTranslation } from "react-i18next";

/**
 * Type for the specific translation function signature we need.
 * This matches the exact call pattern: t(key, { count, defaultValue? })
 */
type PluralizationFunction = (
  key: string,
  options: { count: number; defaultValue?: string }
) => string;

/**
 * Mapping from API asset types to translation key prefixes
 * The API returns lowercase singular forms, but translation keys use capitalized plural forms
 */
const ASSET_TYPE_TO_TRANSLATION_KEY: Record<string, string> = {
  bond: "Bonds",
  equity: "Equities",
  fund: "Funds",
  stablecoin: "Stablecoins",
  deposit: "Deposits",
};

/**
 * Get the translated plural form for asset types
 *
 * This utility function handles proper pluralization for asset types across all languages.
 * It maps API asset types (lowercase, singular) to translation keys (capitalized, plural)
 * and uses react-i18next's built-in pluralization features to automatically select
 * the correct plural form based on the current language's pluralization rules.
 *
 * @param t - The translation function from useTranslation hook
 * @param assetType - The asset type key from API (e.g., 'bond', 'equity', 'stablecoin')
 * @param count - The count to determine plural form
 * @returns The translated and properly pluralized asset type string
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const { t } = useTranslation("assets");
 *
 *   // English: "bond" / "bonds"
 *   const singleBond = getAssetTypePlural(t, 'bond', 1); // "bond"
 *   const multipleBonds = getAssetTypePlural(t, 'bond', 2); // "bonds"
 *
 *   // German: "Anleihe" / "Anleihen"
 *   // Arabic: Complex pluralization with multiple forms
 *
 *   return <div>{singleBond} vs {multipleBonds}</div>;
 * }
 * ```
 */
export function getAssetTypePlural(
  t: PluralizationFunction,
  assetType: string,
  count: number
): string {
  // Map the API asset type to the translation key prefix
  const translationKeyPrefix = ASSET_TYPE_TO_TRANSLATION_KEY[assetType];

  // If we don't have a mapping, fall back to basic English pluralization
  if (!translationKeyPrefix) {
    return count === 1 ? assetType : `${assetType}s`;
  }

  // Use the translation key pattern "TranslationKeyPrefix" which works with i18next pluralization
  // This allows react-i18next to automatically select between "Bonds_one" and "Bonds_other"
  // based on the count and language's pluralization rules
  const translation = t(translationKeyPrefix, { count });

  // If translation is missing (returns the key), fall back to basic English pluralization
  if (translation === translationKeyPrefix) {
    return count === 1 ? assetType : `${assetType}s`;
  }

  return translation;
}

/**
 * Custom hook for asset type pluralization
 *
 * This hook provides a clean interface for pluralizing asset types without
 * needing to handle i18next type casting in every component.
 *
 * @returns A function that takes assetType and count and returns the pluralized translation
 *
 * @example
 * ```typescript
 * function MyComponent() {
 *   const pluralizeAsset = useAssetTypePlural();
 *
 *   const bondText = pluralizeAsset('bond', 1); // "bond"
 *   const bondsText = pluralizeAsset('bond', 2); // "bonds"
 *
 *   return <div>{bondText} vs {bondsText}</div>;
 * }
 * ```
 */
export function useAssetTypePlural() {
  const { t } = useTranslation("assets");

  return (assetType: string, count: number): string => {
    // Type assertion needed because i18next's TFunction has complex overloads
    // that don't directly match our PluralizationFunction interface.
    // This is safe because we know t() supports the (key, options) signature.
    return getAssetTypePlural(t as PluralizationFunction, assetType, count);
  };
}
