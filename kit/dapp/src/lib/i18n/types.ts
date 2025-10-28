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

import type enAccessibilityTranslations from "@/locales/en-US/accessibility.json";
import type enActionsTranslations from "@/locales/en-US/actions.json";
import type enAssetClassTranslations from "@/locales/en-US/asset-class.json";
import type enAssetDesignerTranslations from "@/locales/en-US/asset-designer.json";
import type enAssetExtensionsTranslations from "@/locales/en-US/asset-extensions.json";
import type enAssetTypesTranslations from "@/locales/en-US/asset-types.json";
import type enAssetsTranslations from "@/locales/en-US/assets.json";
import type enAuthTranslations from "@/locales/en-US/auth.json";
import type enBlockchainTranslations from "@/locales/en-US/blockchain.json";
import type enClaimTopicsIssuersTranslations from "@/locales/en-US/claim-topics-issuers.json";
import type enCommonTranslations from "@/locales/en-US/common.json";
import type enComplianceModulesTranslations from "@/locales/en-US/compliance-modules.json";
import type enComponentsTranslations from "@/locales/en-US/components.json";
import type enCountryMultiselectTranslations from "@/locales/en-US/country-multiselect.json";
import type enDashboardTranslations from "@/locales/en-US/dashboard.json";
import type enDataTableTranslations from "@/locales/en-US/data-table.json";
import type enDepositsTableTranslations from "@/locales/en-US/deposits-table.json";
import type enDetailGridTranslations from "@/locales/en-US/detail-grid.json";
import type enErrorsTranslations from "@/locales/en-US/errors.json";
import type enExchangeRatesTranslations from "@/locales/en-US/exchange-rates.json";
import type enFormTranslations from "@/locales/en-US/form.json";
import type enFormatsTranslations from "@/locales/en-US/formats.json";
import type enGeneralTranslations from "@/locales/en-US/general.json";
import type enEntitiesTranslations from "@/locales/en-US/entities.json";
import type enIdentitiesTranslations from "@/locales/en-US/identities.json";
import type enIssuerDashboardTranslations from "@/locales/en-US/issuer-dashboard.json";
import type enLanguageTranslations from "@/locales/en-US/language.json";
import type enNavigationTranslations from "@/locales/en-US/navigation.json";
import type enOnboardingTranslations from "@/locales/en-US/onboarding.json";
import type enSeoTranslations from "@/locales/en-US/seo.json";
import type enSettingsTranslations from "@/locales/en-US/settings.json";
import type enStatsTranslations from "@/locales/en-US/stats.json";
import type enSystemTranslations from "@/locales/en-US/system.json";
import type enThemeTranslations from "@/locales/en-US/theme.json";
import type enToastTranslations from "@/locales/en-US/toast.json";
import type enTokenFactoryTranslations from "@/locales/en-US/token-factory.json";
import type enTokensTranslations from "@/locales/en-US/tokens.json";
import type enUserAssetsTranslations from "@/locales/en-US/user-assets.json";
import type enUserTranslations from "@/locales/en-US/user.json";
import type enValidationTranslations from "@/locales/en-US/validation.json";
import type enWalletTranslations from "@/locales/en-US/wallet.json";

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
      actions: typeof enActionsTranslations;
      accessibility: typeof enAccessibilityTranslations;
      "asset-class": typeof enAssetClassTranslations;
      "asset-designer": typeof enAssetDesignerTranslations;
      "asset-extensions": typeof enAssetExtensionsTranslations;
      "asset-types": typeof enAssetTypesTranslations;
      assets: typeof enAssetsTranslations;
      auth: typeof enAuthTranslations;
      blockchain: typeof enBlockchainTranslations;
      "claim-topics-issuers": typeof enClaimTopicsIssuersTranslations;
      identities: typeof enIdentitiesTranslations;
      entities: typeof enEntitiesTranslations;
      "compliance-modules": typeof enComplianceModulesTranslations;
      common: typeof enCommonTranslations;
      "country-multiselect": typeof enCountryMultiselectTranslations;
      components: typeof enComponentsTranslations;
      dashboard: typeof enDashboardTranslations;
      "data-table": typeof enDataTableTranslations;
      "deposits-table": typeof enDepositsTableTranslations;
      "detail-grid": typeof enDetailGridTranslations;
      errors: typeof enErrorsTranslations;
      "exchange-rates": typeof enExchangeRatesTranslations;
      form: typeof enFormTranslations;
      formats: typeof enFormatsTranslations;
      general: typeof enGeneralTranslations;
      "issuer-dashboard": typeof enIssuerDashboardTranslations;
      stats: typeof enStatsTranslations;
      language: typeof enLanguageTranslations;
      navigation: typeof enNavigationTranslations;
      onboarding: typeof enOnboardingTranslations;
      seo: typeof enSeoTranslations;
      settings: typeof enSettingsTranslations;
      system: typeof enSystemTranslations;
      theme: typeof enThemeTranslations;
      toast: typeof enToastTranslations;
      "token-factory": typeof enTokenFactoryTranslations;
      tokens: typeof enTokensTranslations;
      user: typeof enUserTranslations;
      "user-assets": typeof enUserAssetsTranslations;
      validation: typeof enValidationTranslations;
      wallet: typeof enWalletTranslations;
    };
  }
}
