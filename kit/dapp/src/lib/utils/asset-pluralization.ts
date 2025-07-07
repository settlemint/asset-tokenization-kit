import { useTranslation } from "react-i18next";

/**
 * Type for the specific translation function signature we need.
 * This matches the exact call pattern: t(key, { count, defaultValue })
 */
type PluralizationFunction = (
  key: string,
  options: { count: number; defaultValue: string }
) => string;

/**
 * Get the translated plural form for asset types
 *
 * This utility function handles proper pluralization for asset types across all languages.
 * It uses react-i18next's built-in pluralization features to automatically select
 * the correct plural form based on the current language's pluralization rules.
 *
 * @param t - The translation function from useTranslation hook
 * @param assetType - The asset type key (e.g., 'bond', 'equity', 'stable-coin')
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
  // Use the translation key pattern "assetType_one" and "assetType_other"
  // This allows react-i18next to automatically select the correct plural form
  // based on the language's pluralization rules
  return t(assetType, { count, defaultValue: assetType });
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
