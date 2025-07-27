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
  "asset-designer",
  "asset-types",
  "assets",
  "auth",
  "blockchain",
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
    accessibility: () => import("@/locales/en-US/accessibility.json"),
    "asset-designer": () => import("@/locales/en-US/asset-designer.json"),
    "asset-types": () => import("@/locales/en-US/asset-types.json"),
    assets: () => import("@/locales/en-US/assets.json"),
    auth: () => import("@/locales/en-US/auth.json"),
    blockchain: () => import("@/locales/en-US/blockchain.json"),
    "compliance-modules": () =>
      import("@/locales/en-US/compliance-modules.json"),
    common: () => import("@/locales/en-US/common.json"),
    "country-multiselect": () =>
      import("@/locales/en-US/country-multiselect.json"),
    components: () => import("@/locales/en-US/components.json"),
    dashboard: () => import("@/locales/en-US/dashboard.json"),
    "data-table": () => import("@/locales/en-US/data-table.json"),
    "deposits-table": () => import("@/locales/en-US/deposits-table.json"),
    "detail-grid": () => import("@/locales/en-US/detail-grid.json"),
    errors: () => import("@/locales/en-US/errors.json"),
    "exchange-rates": () => import("@/locales/en-US/exchange-rates.json"),
    form: () => import("@/locales/en-US/form.json"),
    formats: () => import("@/locales/en-US/formats.json"),
    general: () => import("@/locales/en-US/general.json"),
    "issuer-dashboard": () => import("@/locales/en-US/issuer-dashboard.json"),
    language: () => import("@/locales/en-US/language.json"),
    navigation: () => import("@/locales/en-US/navigation.json"),
    onboarding: () => import("@/locales/en-US/onboarding.json"),
    seo: () => import("@/locales/en-US/seo.json"),
    settings: () => import("@/locales/en-US/settings.json"),
    stats: () => import("@/locales/en-US/stats.json"),
    system: () => import("@/locales/en-US/system.json"),
    theme: () => import("@/locales/en-US/theme.json"),
    toast: () => import("@/locales/en-US/toast.json"),
    "token-factory": () => import("@/locales/en-US/token-factory.json"),
    tokens: () => import("@/locales/en-US/tokens.json"),
    user: () => import("@/locales/en-US/user.json"),
    validation: () => import("@/locales/en-US/validation.json"),
    wallet: () => import("@/locales/en-US/wallet.json"),
  },
  "de-DE": {
    accessibility: () => import("@/locales/de-DE/accessibility.json"),
    "asset-designer": () => import("@/locales/de-DE/asset-designer.json"),
    "asset-types": () => import("@/locales/de-DE/asset-types.json"),
    assets: () => import("@/locales/de-DE/assets.json"),
    auth: () => import("@/locales/de-DE/auth.json"),
    blockchain: () => import("@/locales/de-DE/blockchain.json"),
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
    validation: () => import("@/locales/de-DE/validation.json"),
    wallet: () => import("@/locales/de-DE/wallet.json"),
  },
  "ar-SA": {
    accessibility: () => import("@/locales/ar-SA/accessibility.json"),
    "asset-designer": () => import("@/locales/ar-SA/asset-designer.json"),
    "asset-types": () => import("@/locales/ar-SA/asset-types.json"),
    assets: () => import("@/locales/ar-SA/assets.json"),
    auth: () => import("@/locales/ar-SA/auth.json"),
    blockchain: () => import("@/locales/ar-SA/blockchain.json"),
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
    validation: () => import("@/locales/ar-SA/validation.json"),
    wallet: () => import("@/locales/ar-SA/wallet.json"),
  },
  "ja-JP": {
    accessibility: () => import("@/locales/ja-JP/accessibility.json"),
    "asset-designer": () => import("@/locales/ja-JP/asset-designer.json"),
    "asset-types": () => import("@/locales/ja-JP/asset-types.json"),
    assets: () => import("@/locales/ja-JP/assets.json"),
    auth: () => import("@/locales/ja-JP/auth.json"),
    blockchain: () => import("@/locales/ja-JP/blockchain.json"),
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
    return module.default ?? module;
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

// Import all en-US translations for SSR
const enUSResources = {
  accessibility: await import("@/locales/en-US/accessibility.json"),
  "asset-designer": await import("@/locales/en-US/asset-designer.json"),
  "asset-types": await import("@/locales/en-US/asset-types.json"),
  assets: await import("@/locales/en-US/assets.json"),
  auth: await import("@/locales/en-US/auth.json"),
  blockchain: await import("@/locales/en-US/blockchain.json"),
  "compliance-modules": await import("@/locales/en-US/compliance-modules.json"),
  common: await import("@/locales/en-US/common.json"),
  "country-multiselect": await import(
    "@/locales/en-US/country-multiselect.json"
  ),
  components: await import("@/locales/en-US/components.json"),
  dashboard: await import("@/locales/en-US/dashboard.json"),
  "data-table": await import("@/locales/en-US/data-table.json"),
  "deposits-table": await import("@/locales/en-US/deposits-table.json"),
  "detail-grid": await import("@/locales/en-US/detail-grid.json"),
  errors: await import("@/locales/en-US/errors.json"),
  "exchange-rates": await import("@/locales/en-US/exchange-rates.json"),
  form: await import("@/locales/en-US/form.json"),
  formats: await import("@/locales/en-US/formats.json"),
  general: await import("@/locales/en-US/general.json"),
  "issuer-dashboard": await import("@/locales/en-US/issuer-dashboard.json"),
  language: await import("@/locales/en-US/language.json"),
  navigation: await import("@/locales/en-US/navigation.json"),
  onboarding: await import("@/locales/en-US/onboarding.json"),
  seo: await import("@/locales/en-US/seo.json"),
  settings: await import("@/locales/en-US/settings.json"),
  stats: await import("@/locales/en-US/stats.json"),
  system: await import("@/locales/en-US/system.json"),
  theme: await import("@/locales/en-US/theme.json"),
  toast: await import("@/locales/en-US/toast.json"),
  "token-factory": await import("@/locales/en-US/token-factory.json"),
  tokens: await import("@/locales/en-US/tokens.json"),
  user: await import("@/locales/en-US/user.json"),
  validation: await import("@/locales/en-US/validation.json"),
  wallet: await import("@/locales/en-US/wallet.json"),
};

void i18n.init({
  resources: {
    "en-US": enUSResources,
  },
  lng: fallbackLng,
  fallbackLng,
  defaultNS,
  ns: namespaces, // Load all namespaces initially for SSR
  supportedLngs: [...supportedLanguages],
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
