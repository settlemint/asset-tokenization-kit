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
 * Lazy load translation resources
 * This function dynamically imports translation files based on language and namespace
 */
async function loadResource(lng: SupportedLanguage, ns: Namespace) {
  try {
    const module = await import(`@/locales/${lng}/${ns}.json`);
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
