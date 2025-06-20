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

import arAuthTranslations from "@/locales/ar/auth.json";
import arGeneralTranslations from "@/locales/ar/general.json";
import arLanguageTranslations from "@/locales/ar/language.json";
import arOnboardingTranslations from "@/locales/ar/onboarding.json";
import arThemeTranslations from "@/locales/ar/theme.json";
import arTokensTranslations from "@/locales/ar/tokens.json";
import deAuthTranslations from "@/locales/de/auth.json";
import deGeneralTranslations from "@/locales/de/general.json";
import deLanguageTranslations from "@/locales/de/language.json";
import deOnboardingTranslations from "@/locales/de/onboarding.json";
import deThemeTranslations from "@/locales/de/theme.json";
import deTokensTranslations from "@/locales/de/tokens.json";
import enAuthTranslations from "@/locales/en/auth.json";
import enGeneralTranslations from "@/locales/en/general.json";
import enLanguageTranslations from "@/locales/en/language.json";
import enOnboardingTranslations from "@/locales/en/onboarding.json";
import enThemeTranslations from "@/locales/en/theme.json";
import enTokensTranslations from "@/locales/en/tokens.json";
import jaAuthTranslations from "@/locales/ja/auth.json";
import jaGeneralTranslations from "@/locales/ja/general.json";
import jaLanguageTranslations from "@/locales/ja/language.json";
import jaOnboardingTranslations from "@/locales/ja/onboarding.json";
import jaThemeTranslations from "@/locales/ja/theme.json";
import jaTokensTranslations from "@/locales/ja/tokens.json";
import "./types";

/**
 * Default namespace for translations.
 * This is the primary namespace used when no specific namespace is provided.
 */
export const defaultNS = "general";

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
    auth: enAuthTranslations,
    general: enGeneralTranslations,
    theme: enThemeTranslations,
    language: enLanguageTranslations,
    onboarding: enOnboardingTranslations,
    tokens: enTokensTranslations,
  },
  de: {
    auth: deAuthTranslations,
    general: deGeneralTranslations,
    theme: deThemeTranslations,
    language: deLanguageTranslations,
    onboarding: deOnboardingTranslations,
    tokens: deTokensTranslations,
  },
  ar: {
    auth: arAuthTranslations,
    general: arGeneralTranslations,
    theme: arThemeTranslations,
    language: arLanguageTranslations,
    onboarding: arOnboardingTranslations,
    tokens: arTokensTranslations,
  },
  ja: {
    auth: jaAuthTranslations,
    general: jaGeneralTranslations,
    theme: jaThemeTranslations,
    language: jaLanguageTranslations,
    onboarding: jaOnboardingTranslations,
    tokens: jaTokensTranslations,
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
    useSuspense: true, // Important for SSR
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
