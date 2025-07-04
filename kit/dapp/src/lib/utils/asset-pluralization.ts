import { t } from "i18next";

/**
 * Get the translated plural form for asset types
 *
 * This utility function handles proper pluralization for asset types across all languages.
 * It uses react-i18next's built-in pluralization features to automatically select
 * the correct plural form based on the current language's pluralization rules.
 *
 * @param assetType - The asset type key (e.g., 'bond', 'equity', 'stable-coin')
 * @param count - The count to determine plural form
 * @param namespace - The translation namespace (defaults to 'assets')
 * @returns The translated and properly pluralized asset type string
 *
 * @example
 * ```typescript
 * // English: "bond" / "bonds"
 * getAssetTypePlural('bond', 1) // "bond"
 * getAssetTypePlural('bond', 2) // "bonds"
 *
 * // German: "Anleihe" / "Anleihen"
 * getAssetTypePlural('bond', 1) // "Anleihe"
 * getAssetTypePlural('bond', 2) // "Anleihen"
 *
 * // Arabic: Complex pluralization with multiple forms
 * getAssetTypePlural('bond', 0) // "سندات"
 * getAssetTypePlural('bond', 1) // "سند"
 * getAssetTypePlural('bond', 2) // "سندان"
 * ```
 */
export function getAssetTypePlural(
  assetType: string,
  count: number,
  namespace = "assets"
): string {
  // Use the translation key pattern "assetType_one" and "assetType_other"
  // This allows react-i18next to automatically select the correct plural form
  // based on the language's pluralization rules
  const translationKey = `${namespace}:${assetType}`;
  return t(translationKey, { count, defaultValue: assetType });
}
