/**
 * Internationalization (i18n) Configuration
 *
 * This module configures the i18next library for multi-language support
 * in the application. It sets up translation resources, language detection,
 * and React integration for seamless internationalization.
 *
 * Features:
 * - Multi-language support (English, German, Arabic, and Japanese)
 * - Type-safe translations via TypeScript augmentation
 * - SSR-compatible configuration
 * - Automatic language detection (via use-language-detection hook)
 * - Fallback language support
 * - Lazy loading of translation namespaces
 * @see {@link ./types} - TypeScript type augmentation for translations
 * @see {@link ./use-language-detection} - Browser language detection hook
 * @see {@link ../../../locales/} - Translation JSON files
 */

import { createLogger } from "@settlemint/sdk-utils/logging";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import "./types";

// Import all en-US translations synchronously for SSR
import enUSAccessibility from "@/locales/en-US/accessibility.json";
import enUSAssetClass from "@/locales/en-US/asset-class.json";
import enUSAssetDesigner from "@/locales/en-US/asset-designer.json";
import enUSAssetExtensions from "@/locales/en-US/asset-extensions.json";
import enUSAssetTypes from "@/locales/en-US/asset-types.json";
import enUSAssets from "@/locales/en-US/assets.json";
import enUSAuth from "@/locales/en-US/auth.json";
import enUSBlockchain from "@/locales/en-US/blockchain.json";
import enUSClaimTopicsIssuers from "@/locales/en-US/claim-topics-issuers.json";
import enUSCommon from "@/locales/en-US/common.json";
import enUSComplianceModules from "@/locales/en-US/compliance-modules.json";
import enUSComponents from "@/locales/en-US/components.json";
import enUSCountryMultiselect from "@/locales/en-US/country-multiselect.json";
import enUSDashboard from "@/locales/en-US/dashboard.json";
import enUSDataTable from "@/locales/en-US/data-table.json";
import enUSDepositsTable from "@/locales/en-US/deposits-table.json";
import enUSDetailGrid from "@/locales/en-US/detail-grid.json";
import enUSErrors from "@/locales/en-US/errors.json";
import enUSExchangeRates from "@/locales/en-US/exchange-rates.json";
import enUSForm from "@/locales/en-US/form.json";
import enUSFormats from "@/locales/en-US/formats.json";
import enUSGeneral from "@/locales/en-US/general.json";
import enUSIdentities from "@/locales/en-US/identities.json";
import enUSIssuerDashboard from "@/locales/en-US/issuer-dashboard.json";
import enUSLanguage from "@/locales/en-US/language.json";
import enUSNavigation from "@/locales/en-US/navigation.json";
import enUSOnboarding from "@/locales/en-US/onboarding.json";
import enUSSeo from "@/locales/en-US/seo.json";
import enUSSettings from "@/locales/en-US/settings.json";
import enUSStats from "@/locales/en-US/stats.json";
import enUSSystem from "@/locales/en-US/system.json";
import enUSTheme from "@/locales/en-US/theme.json";
import enUSToast from "@/locales/en-US/toast.json";
import enUSTokenFactory from "@/locales/en-US/token-factory.json";
import enUSTokens from "@/locales/en-US/tokens.json";
import enUSUserAssets from "@/locales/en-US/user-assets.json";
import enUSUser from "@/locales/en-US/user.json";
import enUSValidation from "@/locales/en-US/validation.json";
import enUSWallet from "@/locales/en-US/wallet.json";

const logger = createLogger();

/**
 * Default namespace for translations.
 * This is the primary namespace used when no specific namespace is provided.
 */
export const defaultNS = "general";

/**
 * Array of supported language codes.
 */
export const supportedLanguages = ["en-US", "de-DE", "ar-SA", "ja-JP"] as const;

/**
 * Fallback language used when the requested language is not available
 * or when a specific translation key is missing in the current language.
 */
export const fallbackLng = "en-US";

/**
 * Available translation namespaces
 */
export const namespaces = [
  "accessibility",
  "asset-class",
  "asset-designer",
  "asset-extensions",
  "asset-types",
  "assets",
  "auth",
  "blockchain",
  "claim-topics-issuers",
  "identities",
  "compliance-modules",
  "common",
  "country-multiselect",
  "components",
  "dashboard",
  "data-table",
  "deposits-table",
  "detail-grid",
  "errors",
  "exchange-rates",
  "form",
  "formats",
  "general",
  "issuer-dashboard",
  "language",
  "navigation",
  "onboarding",
  "seo",
  "settings",
  "stats",
  "system",
  "theme",
  "toast",
  "token-factory",
  "tokens",
  "user",
  "user-assets",
  "validation",
  "wallet",
] as const;

type SupportedLanguage = (typeof supportedLanguages)[number];
type Namespace = (typeof namespaces)[number];

/**
 * Import all translations statically for production builds
 * These imports are analyzed at build time and included in the bundle
 */
const translationModules = {
  "en-US": {
    // Already loaded synchronously above
  },
  "de-DE": {
    accessibility: () => import("@/locales/de-DE/accessibility.json"),
    "asset-class": () => import("@/locales/de-DE/asset-class.json"),
    "asset-designer": () => import("@/locales/de-DE/asset-designer.json"),
    "asset-extensions": () => import("@/locales/de-DE/asset-extensions.json"),
    "asset-types": () => import("@/locales/de-DE/asset-types.json"),
    assets: () => import("@/locales/de-DE/assets.json"),
    auth: () => import("@/locales/de-DE/auth.json"),
    blockchain: () => import("@/locales/de-DE/blockchain.json"),
    "claim-topics-issuers": () =>
      import("@/locales/de-DE/claim-topics-issuers.json"),
    identities: () => import("@/locales/de-DE/identities.json"),
    "compliance-modules": () =>
      import("@/locales/de-DE/compliance-modules.json"),
    common: () => import("@/locales/de-DE/common.json"),
    "country-multiselect": () =>
      import("@/locales/de-DE/country-multiselect.json"),
    components: () => import("@/locales/de-DE/components.json"),
    dashboard: () => import("@/locales/de-DE/dashboard.json"),
    "data-table": () => import("@/locales/de-DE/data-table.json"),
    "deposits-table": () => import("@/locales/de-DE/deposits-table.json"),
    "detail-grid": () => import("@/locales/de-DE/detail-grid.json"),
    errors: () => import("@/locales/de-DE/errors.json"),
    "exchange-rates": () => import("@/locales/de-DE/exchange-rates.json"),
    form: () => import("@/locales/de-DE/form.json"),
    formats: () => import("@/locales/de-DE/formats.json"),
    general: () => import("@/locales/de-DE/general.json"),
    "issuer-dashboard": () => import("@/locales/de-DE/issuer-dashboard.json"),
    language: () => import("@/locales/de-DE/language.json"),
    navigation: () => import("@/locales/de-DE/navigation.json"),
    onboarding: () => import("@/locales/de-DE/onboarding.json"),
    seo: () => import("@/locales/de-DE/seo.json"),
    settings: () => import("@/locales/de-DE/settings.json"),
    stats: () => import("@/locales/de-DE/stats.json"),
    system: () => import("@/locales/de-DE/system.json"),
    theme: () => import("@/locales/de-DE/theme.json"),
    toast: () => import("@/locales/de-DE/toast.json"),
    "token-factory": () => import("@/locales/de-DE/token-factory.json"),
    tokens: () => import("@/locales/de-DE/tokens.json"),
    user: () => import("@/locales/de-DE/user.json"),
    "user-assets": () => import("@/locales/de-DE/user-assets.json"),
    validation: () => import("@/locales/de-DE/validation.json"),
    wallet: () => import("@/locales/de-DE/wallet.json"),
  },
  "ar-SA": {
    accessibility: () => import("@/locales/ar-SA/accessibility.json"),
    "asset-class": () => import("@/locales/ar-SA/asset-class.json"),
    "asset-designer": () => import("@/locales/ar-SA/asset-designer.json"),
    "asset-extensions": () => import("@/locales/ar-SA/asset-extensions.json"),
    "asset-types": () => import("@/locales/ar-SA/asset-types.json"),
    assets: () => import("@/locales/ar-SA/assets.json"),
    auth: () => import("@/locales/ar-SA/auth.json"),
    blockchain: () => import("@/locales/ar-SA/blockchain.json"),
    "claim-topics-issuers": () =>
      import("@/locales/ar-SA/claim-topics-issuers.json"),
    identities: () => import("@/locales/ar-SA/identities.json"),
    "compliance-modules": () =>
      import("@/locales/ar-SA/compliance-modules.json"),
    common: () => import("@/locales/ar-SA/common.json"),
    "country-multiselect": () =>
      import("@/locales/ar-SA/country-multiselect.json"),
    components: () => import("@/locales/ar-SA/components.json"),
    dashboard: () => import("@/locales/ar-SA/dashboard.json"),
    "data-table": () => import("@/locales/ar-SA/data-table.json"),
    "deposits-table": () => import("@/locales/ar-SA/deposits-table.json"),
    "detail-grid": () => import("@/locales/ar-SA/detail-grid.json"),
    errors: () => import("@/locales/ar-SA/errors.json"),
    "exchange-rates": () => import("@/locales/ar-SA/exchange-rates.json"),
    form: () => import("@/locales/ar-SA/form.json"),
    formats: () => import("@/locales/ar-SA/formats.json"),
    general: () => import("@/locales/ar-SA/general.json"),
    "issuer-dashboard": () => import("@/locales/ar-SA/issuer-dashboard.json"),
    language: () => import("@/locales/ar-SA/language.json"),
    navigation: () => import("@/locales/ar-SA/navigation.json"),
    onboarding: () => import("@/locales/ar-SA/onboarding.json"),
    seo: () => import("@/locales/ar-SA/seo.json"),
    settings: () => import("@/locales/ar-SA/settings.json"),
    stats: () => import("@/locales/ar-SA/stats.json"),
    system: () => import("@/locales/ar-SA/system.json"),
    theme: () => import("@/locales/ar-SA/theme.json"),
    toast: () => import("@/locales/ar-SA/toast.json"),
    "token-factory": () => import("@/locales/ar-SA/token-factory.json"),
    tokens: () => import("@/locales/ar-SA/tokens.json"),
    user: () => import("@/locales/ar-SA/user.json"),
    "user-assets": () => import("@/locales/ar-SA/user-assets.json"),
    validation: () => import("@/locales/ar-SA/validation.json"),
    wallet: () => import("@/locales/ar-SA/wallet.json"),
  },
  "ja-JP": {
    accessibility: () => import("@/locales/ja-JP/accessibility.json"),
    "asset-class": () => import("@/locales/ja-JP/asset-class.json"),
    "asset-designer": () => import("@/locales/ja-JP/asset-designer.json"),
    "asset-extensions": () => import("@/locales/ja-JP/asset-extensions.json"),
    "asset-types": () => import("@/locales/ja-JP/asset-types.json"),
    assets: () => import("@/locales/ja-JP/assets.json"),
    auth: () => import("@/locales/ja-JP/auth.json"),
    blockchain: () => import("@/locales/ja-JP/blockchain.json"),
    "claim-topics-issuers": () =>
      import("@/locales/ja-JP/claim-topics-issuers.json"),
    identities: () => import("@/locales/ja-JP/identities.json"),
    "compliance-modules": () =>
      import("@/locales/ja-JP/compliance-modules.json"),
    common: () => import("@/locales/ja-JP/common.json"),
    "country-multiselect": () =>
      import("@/locales/ja-JP/country-multiselect.json"),
    components: () => import("@/locales/ja-JP/components.json"),
    dashboard: () => import("@/locales/ja-JP/dashboard.json"),
    "data-table": () => import("@/locales/ja-JP/data-table.json"),
    "deposits-table": () => import("@/locales/ja-JP/deposits-table.json"),
    "detail-grid": () => import("@/locales/ja-JP/detail-grid.json"),
    errors: () => import("@/locales/ja-JP/errors.json"),
    "exchange-rates": () => import("@/locales/ja-JP/exchange-rates.json"),
    form: () => import("@/locales/ja-JP/form.json"),
    formats: () => import("@/locales/ja-JP/formats.json"),
    general: () => import("@/locales/ja-JP/general.json"),
    "issuer-dashboard": () => import("@/locales/ja-JP/issuer-dashboard.json"),
    language: () => import("@/locales/ja-JP/language.json"),
    navigation: () => import("@/locales/ja-JP/navigation.json"),
    onboarding: () => import("@/locales/ja-JP/onboarding.json"),
    seo: () => import("@/locales/ja-JP/seo.json"),
    settings: () => import("@/locales/ja-JP/settings.json"),
    stats: () => import("@/locales/ja-JP/stats.json"),
    system: () => import("@/locales/ja-JP/system.json"),
    theme: () => import("@/locales/ja-JP/theme.json"),
    toast: () => import("@/locales/ja-JP/toast.json"),
    "token-factory": () => import("@/locales/ja-JP/token-factory.json"),
    tokens: () => import("@/locales/ja-JP/tokens.json"),
    user: () => import("@/locales/ja-JP/user.json"),
    "user-assets": () => import("@/locales/ja-JP/user-assets.json"),
    validation: () => import("@/locales/ja-JP/validation.json"),
    wallet: () => import("@/locales/ja-JP/wallet.json"),
  },
} as const;

/**
 * Lazy load translation resources
 * This function uses static imports that are analyzed at build time
 */
async function loadResource(lng: SupportedLanguage, ns: Namespace) {
  try {
    // For en-US, return the already imported resources
    if (lng === "en-US") {
      const enUSResources: Record<Namespace, unknown> = {
        accessibility: enUSAccessibility,
        "asset-class": enUSAssetClass,
        "asset-designer": enUSAssetDesigner,
        "asset-extensions": enUSAssetExtensions,
        "asset-types": enUSAssetTypes,
        assets: enUSAssets,
        auth: enUSAuth,
        blockchain: enUSBlockchain,
        "claim-topics-issuers": enUSClaimTopicsIssuers,
        identities: enUSIdentities,
        "compliance-modules": enUSComplianceModules,
        common: enUSCommon,
        "country-multiselect": enUSCountryMultiselect,
        components: enUSComponents,
        dashboard: enUSDashboard,
        "data-table": enUSDataTable,
        "deposits-table": enUSDepositsTable,
        "detail-grid": enUSDetailGrid,
        errors: enUSErrors,
        "exchange-rates": enUSExchangeRates,
        form: enUSForm,
        formats: enUSFormats,
        general: enUSGeneral,
        "issuer-dashboard": enUSIssuerDashboard,
        language: enUSLanguage,
        navigation: enUSNavigation,
        onboarding: enUSOnboarding,
        seo: enUSSeo,
        settings: enUSSettings,
        stats: enUSStats,
        system: enUSSystem,
        theme: enUSTheme,
        toast: enUSToast,
        "token-factory": enUSTokenFactory,
        tokens: enUSTokens,
        user: enUSUser,
        "user-assets": enUSUserAssets,
        validation: enUSValidation,
        wallet: enUSWallet,
      };
      return enUSResources[ns] || {};
    }

    const languageModules = translationModules[lng];
    if (!languageModules) {
      logger.warn(`Language not found: ${lng}`);
      return {};
    }

    const moduleLoader = languageModules[ns];
    if (!moduleLoader) {
      logger.warn(`Namespace not found: ${lng}/${ns}`);
      return {};
    }

    const module = await moduleLoader();
    // Handle both default exports and direct exports
    return module.default || module;
  } catch (error) {
    logger.warn(`Failed to load translation: ${lng}/${ns}`, error);
    return {};
  }
}

/**
 * Custom backend for i18next that loads translations dynamically
 */
const lazyLoadBackend = {
  type: "backend" as const,
  init: () => {
    // No initialization needed
  },
  read: async (
    lng: string,
    ns: string,
    callback: (err: Error | null, data?: unknown) => void
  ) => {
    try {
      const data = await loadResource(
        lng as SupportedLanguage,
        ns as Namespace
      );
      callback(null, data);
    } catch (error) {
      callback(error as Error);
    }
  },
};

/**
 * Initialize i18next with React integration and configuration.
 *
 * Configuration options:
 * - resources: Initial translation data for essential namespaces
 * - backend: Custom backend for lazy loading additional namespaces
 * - lng: Initial language (set to fallback until detection runs)
 * - fallbackLng: Language to use when translation is missing
 * - defaultNS: Default namespace for translations
 * - ns: Initial namespaces (only essentials)
 * - interpolation.escapeValue: Disabled as React handles XSS protection
 * - react.useSuspense: Enabled for SSR compatibility
 * - partialBundledLanguages: True to allow partial loading
 *
 * The void operator is used to explicitly discard the promise,
 * as initialization happens synchronously for our use case.
 */
i18n.use(lazyLoadBackend).use(initReactI18next);

void i18n.init({
  resources: {
    "en-US": {
      accessibility: enUSAccessibility,
      "asset-class": enUSAssetClass,
      "asset-designer": enUSAssetDesigner,
      "asset-extensions": enUSAssetExtensions,
      "asset-types": enUSAssetTypes,
      assets: enUSAssets,
      auth: enUSAuth,
      blockchain: enUSBlockchain,
      "claim-topics-issuers": enUSClaimTopicsIssuers,
      identities: enUSIdentities,
      "compliance-modules": enUSComplianceModules,
      common: enUSCommon,
      "country-multiselect": enUSCountryMultiselect,
      components: enUSComponents,
      dashboard: enUSDashboard,
      "data-table": enUSDataTable,
      "deposits-table": enUSDepositsTable,
      "detail-grid": enUSDetailGrid,
      errors: enUSErrors,
      "exchange-rates": enUSExchangeRates,
      form: enUSForm,
      formats: enUSFormats,
      general: enUSGeneral,
      "issuer-dashboard": enUSIssuerDashboard,
      language: enUSLanguage,
      navigation: enUSNavigation,
      onboarding: enUSOnboarding,
      seo: enUSSeo,
      settings: enUSSettings,
      stats: enUSStats,
      system: enUSSystem,
      theme: enUSTheme,
      toast: enUSToast,
      "token-factory": enUSTokenFactory,
      tokens: enUSTokens,
      user: enUSUser,
      validation: enUSValidation,
      wallet: enUSWallet,
    },
  },
  lng: fallbackLng,
  fallbackLng,
  defaultNS,
  ns: namespaces, // Load all namespaces initially for SSR
  supportedLngs: [...supportedLanguages],
  nonExplicitSupportedLngs: true,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: true, // Important for SSR
  },
  partialBundledLanguages: true,
});

/**
 * The configured i18next instance.
 *
 * This instance is used throughout the application via React hooks:
 * - useTranslation: Access translation function
 * - Trans: Component for complex translations with JSX
 * - I18nextProvider: Context provider (auto-configured by react-i18next)
 * @example
 * ```typescript
 * import { useTranslation } from 'react-i18next';
 *
 * function MyComponent() {
 *   const { t } = useTranslation(['tokens', 'common']);
 *   return <h1>{t('tokens:welcome.title')}</h1>;
 * }
 * ```
 */

// eslint-disable-next-line no-barrel-files/no-barrel-files, unicorn/prefer-export-from
export default i18n;
