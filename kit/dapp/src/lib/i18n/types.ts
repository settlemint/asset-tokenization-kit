/**
 * TypeScript Type Augmentation for i18next
 *
 * This module extends i18next's type definitions to provide full type safety
 * for translation keys throughout the application. By augmenting the module's
 * types, TypeScript can:
 *
 * - Validate translation keys at compile time
 * - Provide autocomplete for translation keys in IDEs
 * - Catch typos and missing translations during development
 * - Ensure type safety when using interpolation variables
 *
 * The augmentation uses the English translations as the source of truth
 * for available keys, ensuring all translations have the same structure.
 * @example
 * ```typescript
 * // With this augmentation, TypeScript will validate translation keys:
 * t('welcome.title') // ✅ Valid - autocomplete works
 * t('invalid.key')   // ❌ Error - TypeScript catches this
 *
 * // Also provides type safety for interpolation:
 * t('user.greeting', { name: 'John' }) // TypeScript knows 'name' is required
 * ```
 * @see {@link ./index} - Main i18n configuration
 * @see https://www.i18next.com/overview/typescript - i18next TypeScript documentation
 */

import type enAssetDesignerTranslations from "@/locales/en/asset-designer.json";
import type enAuthTranslations from "@/locales/en/auth.json";
import type enFormTranslations from "@/locales/en/form.json";
import type enGeneralTranslations from "@/locales/en/general.json";
import type enLanguageTranslations from "@/locales/en/language.json";
import type enOnboardingTranslations from "@/locales/en/onboarding.json";
import type enThemeTranslations from "@/locales/en/theme.json";
import type enTokensTranslations from "@/locales/en/tokens.json";

declare module "i18next" {
  /**
   * Custom type options for i18next.
   *
   * This interface tells TypeScript about our specific i18n configuration:
   * - defaultNS: The default namespace to use when none is specified
   * - resources: The structure of our translation resources
   *
   * Using English ('en') as the type source ensures all languages
   * maintain the same key structure.
   */
  interface CustomTypeOptions {
    /**
     * Default namespace for translations.
     * When using t('key') without a namespace, this namespace is used.
     */
    defaultNS: "general";

    /**
     * Resource type definition based on English translations.
     * This provides the structure that all translations must follow.
     */
    resources: {
      "asset-designer": typeof enAssetDesignerTranslations;
      auth: typeof enAuthTranslations;
      form: typeof enFormTranslations;
      general: typeof enGeneralTranslations;
      theme: typeof enThemeTranslations;
      language: typeof enLanguageTranslations;
      onboarding: typeof enOnboardingTranslations;
      tokens: typeof enTokensTranslations;
    };
  }
}
