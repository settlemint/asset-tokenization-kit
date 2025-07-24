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
export const supportedLanguages = ["en", "de", "ar", "ja"] as const;

/**
 * Fallback language used when the requested language is not available
 * or when a specific translation key is missing in the current language.
 */
export const fallbackLng = "en";

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
  "common",
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
    const module = await import(`../../../locales/${lng}/${ns}.json`);
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
    } catch (err) {
      callback(err as Error);
    }
  },
};

/**
 * Initialize resources with only essential namespaces
 * Other namespaces will be loaded on demand
 */
// Load essential namespaces synchronously for SSR
// These imports are kept to ensure critical translations are available immediately
import arCommonTranslations from "@/locales/ar/common.json";
import arGeneralTranslations from "@/locales/ar/general.json";
import deCommonTranslations from "@/locales/de/common.json";
import deGeneralTranslations from "@/locales/de/general.json";
import enCommonTranslations from "@/locales/en/common.json";
import enGeneralTranslations from "@/locales/en/general.json";
import jaCommonTranslations from "@/locales/ja/common.json";
import jaGeneralTranslations from "@/locales/ja/general.json";

const initialResources = {
  en: {
    general: enGeneralTranslations,
    common: enCommonTranslations,
  },
  de: {
    general: deGeneralTranslations,
    common: deCommonTranslations,
  },
  ar: {
    general: arGeneralTranslations,
    common: arCommonTranslations,
  },
  ja: {
    general: jaGeneralTranslations,
    common: jaCommonTranslations,
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
  resources: initialResources,
  lng: fallbackLng,
  fallbackLng,
  defaultNS,
  ns: [defaultNS, "common"], // Only load essential namespaces initially
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
// eslint-disable-next-line no-barrel-files/no-barrel-files
export default i18n;
