/**
 * Internationalization (i18n) Configuration
 * 
 * This module configures the i18next library for multi-language support
 * in the application. It sets up translation resources, language detection,
 * and React integration for seamless internationalization.
 * 
 * Features:
 * - Multi-language support (English and German)
 * - Type-safe translations via TypeScript augmentation
 * - SSR-compatible configuration
 * - Automatic language detection (via use-language-detection hook)
 * - Fallback language support
 * 
 * @see {@link ./types} - TypeScript type augmentation for translations
 * @see {@link ./use-language-detection} - Browser language detection hook
 * @see {@link ../../../locales/} - Translation JSON files
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "../../../locales/en.json";
import deTranslations from "../../../locales/de.json";
import "./types";

/**
 * Default namespace for translations.
 * This is the primary namespace used when no specific namespace is provided.
 */
export const defaultNS = "translation";

/**
 * Translation resources object containing all available translations.
 * 
 * Structure:
 * - Each language code (e.g., 'en', 'de') maps to an object
 * - Each language object contains namespaces (currently only 'translation')
 * - Each namespace contains the actual translation key-value pairs
 * 
 * The 'as const' assertion ensures TypeScript treats this as a literal type,
 * enabling type-safe translation keys throughout the application.
 */
export const resources = {
  en: {
    translation: enTranslations,
  },
  de: {
    translation: deTranslations,
  },
} as const;

/**
 * Array of supported language codes.
 * Dynamically derived from the resources object to ensure consistency.
 */
export const supportedLanguages = Object.keys(resources);

/**
 * Fallback language used when the requested language is not available
 * or when a specific translation key is missing in the current language.
 */
export const fallbackLng = "en";

/**
 * Initialize i18next with React integration and configuration.
 * 
 * Configuration options:
 * - resources: Translation data for all supported languages
 * - lng: Initial language (set to fallback until detection runs)
 * - fallbackLng: Language to use when translation is missing
 * - defaultNS: Default namespace for translations
 * - interpolation.escapeValue: Disabled as React handles XSS protection
 * - react.useSuspense: Disabled for SSR compatibility
 * 
 * The void operator is used to explicitly discard the promise,
 * as initialization happens synchronously for our use case.
 */
void i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLng,
  fallbackLng,
  defaultNS,
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false, // Important for SSR
  },
});

/**
 * The configured i18next instance.
 * 
 * This instance is used throughout the application via React hooks:
 * - useTranslation: Access translation function
 * - Trans: Component for complex translations with JSX
 * - I18nextProvider: Context provider (auto-configured by react-i18next)
 * 
 * @example
 * ```typescript
 * import { useTranslation } from 'react-i18next';
 * 
 * function MyComponent() {
 *   const { t } = useTranslation();
 *   return <h1>{t('welcome.title')}</h1>;
 * }
 * ```
 */
export default i18n;