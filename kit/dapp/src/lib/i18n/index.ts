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
 * @see {@link ./types} - TypeScript type augmentation for translations
 * @see {@link ./use-language-detection} - Browser language detection hook
 * @see {@link ../../../locales/} - Translation JSON files
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English translations
import enAccessibilityTranslations from "@/locales/en/accessibility.json";
import enAssetDesignerTranslations from "@/locales/en/asset-designer.json";
import enAssetTypesTranslations from "@/locales/en/asset-types.json";
import enAssetsTranslations from "@/locales/en/assets.json";
import enAuthTranslations from "@/locales/en/auth.json";
import enBlockchainTranslations from "@/locales/en/blockchain.json";
import enCommonTranslations from "@/locales/en/common.json";
import enDashboardTranslations from "@/locales/en/dashboard.json";
import enDataTableTranslations from "@/locales/en/data-table.json";
import enDepositsTableTranslations from "@/locales/en/deposits-table.json";
import enErrorsTranslations from "@/locales/en/errors.json";
import enFormTranslations from "@/locales/en/form.json";
import enFormatsTranslations from "@/locales/en/formats.json";
import enGeneralTranslations from "@/locales/en/general.json";
import enIssuerDashboardTranslations from "@/locales/en/issuer-dashboard.json";
import enLanguageTranslations from "@/locales/en/language.json";
import enNavigationTranslations from "@/locales/en/navigation.json";
import enOnboardingTranslations from "@/locales/en/onboarding.json";
import enSeoTranslations from "@/locales/en/seo.json";
import enThemeTranslations from "@/locales/en/theme.json";
import enToastTranslations from "@/locales/en/toast.json";
import enTokenFactoryTranslations from "@/locales/en/token-factory.json";
import enTokensTranslations from "@/locales/en/tokens.json";
import enValidationTranslations from "@/locales/en/validation.json";
import enWalletTranslations from "@/locales/en/wallet.json";

// German translations
import deAccessibilityTranslations from "@/locales/de/accessibility.json";
import deAssetDesignerTranslations from "@/locales/de/asset-designer.json";
import deAssetTypesTranslations from "@/locales/de/asset-types.json";
import deAssetsTranslations from "@/locales/de/assets.json";
import deAuthTranslations from "@/locales/de/auth.json";
import deBlockchainTranslations from "@/locales/de/blockchain.json";
import deCommonTranslations from "@/locales/de/common.json";
import deDashboardTranslations from "@/locales/de/dashboard.json";
import deDataTableTranslations from "@/locales/de/data-table.json";
import deDepositsTableTranslations from "@/locales/de/deposits-table.json";
import deErrorsTranslations from "@/locales/de/errors.json";
import deFormTranslations from "@/locales/de/form.json";
import deFormatsTranslations from "@/locales/de/formats.json";
import deGeneralTranslations from "@/locales/de/general.json";
import deIssuerDashboardTranslations from "@/locales/de/issuer-dashboard.json";
import deLanguageTranslations from "@/locales/de/language.json";
import deNavigationTranslations from "@/locales/de/navigation.json";
import deOnboardingTranslations from "@/locales/de/onboarding.json";
import deSeoTranslations from "@/locales/de/seo.json";
import deThemeTranslations from "@/locales/de/theme.json";
import deToastTranslations from "@/locales/de/toast.json";
import deTokenFactoryTranslations from "@/locales/de/token-factory.json";
import deTokensTranslations from "@/locales/de/tokens.json";
import deValidationTranslations from "@/locales/de/validation.json";
import deWalletTranslations from "@/locales/de/wallet.json";

// Arabic translations
import arAccessibilityTranslations from "@/locales/ar/accessibility.json";
import arAssetDesignerTranslations from "@/locales/ar/asset-designer.json";
import arAssetTypesTranslations from "@/locales/ar/asset-types.json";
import arAssetsTranslations from "@/locales/ar/assets.json";
import arAuthTranslations from "@/locales/ar/auth.json";
import arBlockchainTranslations from "@/locales/ar/blockchain.json";
import arCommonTranslations from "@/locales/ar/common.json";
import arDashboardTranslations from "@/locales/ar/dashboard.json";
import arDataTableTranslations from "@/locales/ar/data-table.json";
import arDepositsTableTranslations from "@/locales/ar/deposits-table.json";
import arErrorsTranslations from "@/locales/ar/errors.json";
import arFormTranslations from "@/locales/ar/form.json";
import arFormatsTranslations from "@/locales/ar/formats.json";
import arGeneralTranslations from "@/locales/ar/general.json";
import arIssuerDashboardTranslations from "@/locales/ar/issuer-dashboard.json";
import arLanguageTranslations from "@/locales/ar/language.json";
import arNavigationTranslations from "@/locales/ar/navigation.json";
import arOnboardingTranslations from "@/locales/ar/onboarding.json";
import arSeoTranslations from "@/locales/ar/seo.json";
import arThemeTranslations from "@/locales/ar/theme.json";
import arToastTranslations from "@/locales/ar/toast.json";
import arTokenFactoryTranslations from "@/locales/ar/token-factory.json";
import arTokensTranslations from "@/locales/ar/tokens.json";
import arValidationTranslations from "@/locales/ar/validation.json";
import arWalletTranslations from "@/locales/ar/wallet.json";

// Japanese translations
import jaAccessibilityTranslations from "@/locales/ja/accessibility.json";
import jaAssetDesignerTranslations from "@/locales/ja/asset-designer.json";
import jaAssetTypesTranslations from "@/locales/ja/asset-types.json";
import jaAssetsTranslations from "@/locales/ja/assets.json";
import jaAuthTranslations from "@/locales/ja/auth.json";
import jaBlockchainTranslations from "@/locales/ja/blockchain.json";
import jaCommonTranslations from "@/locales/ja/common.json";
import jaDashboardTranslations from "@/locales/ja/dashboard.json";
import jaDataTableTranslations from "@/locales/ja/data-table.json";
import jaDepositsTableTranslations from "@/locales/ja/deposits-table.json";
import jaErrorsTranslations from "@/locales/ja/errors.json";
import jaFormTranslations from "@/locales/ja/form.json";
import jaFormatsTranslations from "@/locales/ja/formats.json";
import jaGeneralTranslations from "@/locales/ja/general.json";
import jaIssuerDashboardTranslations from "@/locales/ja/issuer-dashboard.json";
import jaLanguageTranslations from "@/locales/ja/language.json";
import jaNavigationTranslations from "@/locales/ja/navigation.json";
import jaOnboardingTranslations from "@/locales/ja/onboarding.json";
import jaSeoTranslations from "@/locales/ja/seo.json";
import jaThemeTranslations from "@/locales/ja/theme.json";
import jaToastTranslations from "@/locales/ja/toast.json";
import jaTokenFactoryTranslations from "@/locales/ja/token-factory.json";
import jaTokensTranslations from "@/locales/ja/tokens.json";
import jaValidationTranslations from "@/locales/ja/validation.json";
import jaWalletTranslations from "@/locales/ja/wallet.json";

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
    accessibility: enAccessibilityTranslations,
    "asset-designer": enAssetDesignerTranslations,
    "asset-types": enAssetTypesTranslations,
    assets: enAssetsTranslations,
    auth: enAuthTranslations,
    blockchain: enBlockchainTranslations,
    common: enCommonTranslations,
    dashboard: enDashboardTranslations,
    "data-table": enDataTableTranslations,
    "deposits-table": enDepositsTableTranslations,
    errors: enErrorsTranslations,
    form: enFormTranslations,
    formats: enFormatsTranslations,
    general: enGeneralTranslations,
    "issuer-dashboard": enIssuerDashboardTranslations,
    language: enLanguageTranslations,
    navigation: enNavigationTranslations,
    onboarding: enOnboardingTranslations,
    seo: enSeoTranslations,
    theme: enThemeTranslations,
    toast: enToastTranslations,
    "token-factory": enTokenFactoryTranslations,
    tokens: enTokensTranslations,
    validation: enValidationTranslations,
    wallet: enWalletTranslations,
  },
  de: {
    accessibility: deAccessibilityTranslations,
    "asset-designer": deAssetDesignerTranslations,
    "asset-types": deAssetTypesTranslations,
    assets: deAssetsTranslations,
    auth: deAuthTranslations,
    blockchain: deBlockchainTranslations,
    common: deCommonTranslations,
    dashboard: deDashboardTranslations,
    "data-table": deDataTableTranslations,
    "deposits-table": deDepositsTableTranslations,
    errors: deErrorsTranslations,
    form: deFormTranslations,
    formats: deFormatsTranslations,
    general: deGeneralTranslations,
    "issuer-dashboard": deIssuerDashboardTranslations,
    language: deLanguageTranslations,
    navigation: deNavigationTranslations,
    onboarding: deOnboardingTranslations,
    seo: deSeoTranslations,
    theme: deThemeTranslations,
    toast: deToastTranslations,
    "token-factory": deTokenFactoryTranslations,
    tokens: deTokensTranslations,
    validation: deValidationTranslations,
    wallet: deWalletTranslations,
  },
  ar: {
    accessibility: arAccessibilityTranslations,
    "asset-designer": arAssetDesignerTranslations,
    "asset-types": arAssetTypesTranslations,
    assets: arAssetsTranslations,
    auth: arAuthTranslations,
    blockchain: arBlockchainTranslations,
    common: arCommonTranslations,
    dashboard: arDashboardTranslations,
    "data-table": arDataTableTranslations,
    "deposits-table": arDepositsTableTranslations,
    errors: arErrorsTranslations,
    form: arFormTranslations,
    formats: arFormatsTranslations,
    general: arGeneralTranslations,
    "issuer-dashboard": arIssuerDashboardTranslations,
    language: arLanguageTranslations,
    navigation: arNavigationTranslations,
    onboarding: arOnboardingTranslations,
    seo: arSeoTranslations,
    theme: arThemeTranslations,
    toast: arToastTranslations,
    "token-factory": arTokenFactoryTranslations,
    tokens: arTokensTranslations,
    validation: arValidationTranslations,
    wallet: arWalletTranslations,
  },
  ja: {
    accessibility: jaAccessibilityTranslations,
    "asset-designer": jaAssetDesignerTranslations,
    "asset-types": jaAssetTypesTranslations,
    assets: jaAssetsTranslations,
    auth: jaAuthTranslations,
    blockchain: jaBlockchainTranslations,
    common: jaCommonTranslations,
    dashboard: jaDashboardTranslations,
    "data-table": jaDataTableTranslations,
    "deposits-table": jaDepositsTableTranslations,
    errors: jaErrorsTranslations,
    form: jaFormTranslations,
    formats: jaFormatsTranslations,
    general: jaGeneralTranslations,
    "issuer-dashboard": jaIssuerDashboardTranslations,
    language: jaLanguageTranslations,
    navigation: jaNavigationTranslations,
    onboarding: jaOnboardingTranslations,
    seo: jaSeoTranslations,
    theme: jaThemeTranslations,
    toast: jaToastTranslations,
    "token-factory": jaTokenFactoryTranslations,
    tokens: jaTokensTranslations,
    validation: jaValidationTranslations,
    wallet: jaWalletTranslations,
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
// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next);
// eslint-disable-next-line import/no-named-as-default-member
void i18n.init({
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
