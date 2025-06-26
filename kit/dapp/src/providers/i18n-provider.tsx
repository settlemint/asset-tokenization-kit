/**
 * Internationalization Provider Component
 *
 * This module provides internationalization (i18n) context for the application,
 * enabling multi-language support with automatic language detection and switching.
 * It wraps the application with React i18next provider and handles:
 *
 * - Language detection from browser settings or stored preferences
 * - Dynamic language switching
 * - Translation context for all child components
 * - Initial language override support
 * - RTL (Right-to-Left) support for languages like Arabic
 *
 * The provider uses a two-component structure to ensure proper initialization:
 * 1. I18nProvider - Handles initial language setup and provides i18n context
 * 2. I18nProviderContent - Activates language detection after context is established
 *
 * @see {@link @/lib/i18n/index} - i18n configuration and resources
 * @see {@link @/lib/i18n/use-language-detection} - Language detection logic
 * @see {@link https://react.i18next.com} - React i18next documentation
 */

import { default as i18n } from "@/lib/i18n/index";
import { useLanguageDetection } from "@/lib/i18n/use-language-detection";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";

/**
 * RTL languages that require right-to-left text direction
 */
const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

/**
 * Props for the I18nProvider component.
 */
interface I18nProviderProps {
  /**
   * Child components that need access to translations.
   */
  children: React.ReactNode;

  /**
   * Optional initial language to set.
   * Overrides automatic language detection if provided.
   * Useful for SSR or when language is determined by URL/user preference.
   */
  initialLanguage?: string;
}

/**
 * Internal component that activates language detection after i18n context is established.
 *
 * This component must be rendered inside I18nextProvider to access the i18n
 * instance through React context. It handles:
 * - Automatic language detection on mount
 * - Language persistence to localStorage
 * - RTL support for applicable languages
 *
 * @param children - Components to render after language detection is activated
 */
function I18nProviderContent({ children }: { children: React.ReactNode }) {
  // Activate language detection hook
  const currentLanguage = useLanguageDetection();

  /**
   * Effect to handle RTL support and HTML attributes
   * Updates the HTML element's dir and lang attributes based on the current language
   */
  useEffect(() => {
    if (currentLanguage) {
      // Update HTML lang attribute
      document.documentElement.lang = currentLanguage;

      // Update HTML dir attribute for RTL languages
      const isRTL = RTL_LANGUAGES.includes(currentLanguage);
      document.documentElement.dir = isRTL ? "rtl" : "ltr";
    }
  }, [currentLanguage]);

  return <>{children}</>;
}

/**
 * Internationalization provider that wraps the application with translation context.
 *
 * This provider enables all child components to:
 * - Access translations via `useTranslation` hook
 * - Switch languages dynamically
 * - Render translated content with `Trans` component
 * - Format dates, numbers, and currencies according to locale
 *
 * @param children - Components that need translation capabilities
 * @param initialLanguage - Optional language to set on mount
 *
 * @example
 * ```tsx
 * // Basic usage with automatic language detection
 * <I18nProvider>
 *   <App />
 * </I18nProvider>
 *
 * // With initial language override
 * <I18nProvider initialLanguage="de">
 *   <App />
 * </I18nProvider>
 *
 * // Using translations in a component
 * import { useTranslation } from 'react-i18next';
 *
 * function MyComponent() {
 *   const { t, i18n } = useTranslation();
 *
 *   return (
 *     <div>
 *       <h1>{t('welcome.title')}</h1>
 *       <button onClick={() => i18n.changeLanguage('de')}>
 *         Switch to German
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function I18nProvider({ children, initialLanguage }: I18nProviderProps) {
  /**
   * Handle initial language override.
   * Changes the language if initialLanguage is provided and different from current.
   */
  if (initialLanguage && initialLanguage !== i18n.language) {
    void i18n.changeLanguage(initialLanguage);
  }

  return (
    <I18nextProvider i18n={i18n}>
      <I18nProviderContent>{children}</I18nProviderContent>
    </I18nextProvider>
  );
}
