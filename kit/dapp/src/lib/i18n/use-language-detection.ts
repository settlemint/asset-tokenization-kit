/**
 * Language Detection Hook
 *
 * This module provides a custom React hook for automatic language detection
 * and persistence. It implements a smart language selection strategy that
 * respects user preferences while providing sensible defaults.
 * @see {@link ./index} - Main i18n configuration with supported languages
 */

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { fallbackLng, supportedLanguages } from "./index";

/**
 * Custom hook for automatic language detection and management.
 *
 * This hook implements a three-tier language detection strategy:
 * 1. **Stored Preference**: Check localStorage for previously selected language
 * 2. **Browser Language**: Detect from navigator.language if no stored preference
 * 3. **Fallback**: Use default language if browser language is not supported
 *
 * The hook also:
 * - Persists language changes to localStorage for future visits
 * - Validates that detected languages are actually supported
 * - Returns the current active language for component use
 * @example
 * ```typescript
 * function App() {
 *   const currentLanguage = useLanguageDetection();
 *
 *   return (
 *     <div>
 *       <p>Current language: {currentLanguage}</p>
 *       <LanguageSelector />
 *     </div>
 *   );
 * }
 * ```
 */
export function useLanguageDetection() {
  const { i18n } = useTranslation();

  /**
   * Effect: Language detection and initialization
   *
   * Runs once on mount to detect and set the initial language.
   * Priority order:
   * 1. User's saved preference from localStorage
   * 2. Browser's language setting
   * 3. Application's fallback language
   */
  useEffect(() => {
    // Check if language is already set (e.g., from localStorage)
    const storedLang = localStorage.getItem("i18nextLng");
    if (
      storedLang &&
      supportedLanguages.includes(
        storedLang as (typeof supportedLanguages)[number]
      )
    ) {
      void i18n.changeLanguage(storedLang);
      return;
    }

    // Detect browser language
    // Split to get base language code (e.g., 'en' from 'en-US')
    const browserLang = navigator.language.split("-")[0];
    const detectedLang =
      browserLang &&
      supportedLanguages.includes(
        browserLang as (typeof supportedLanguages)[number]
      )
        ? browserLang
        : fallbackLng;

    // Set detected language
    void i18n.changeLanguage(detectedLang);
  }, [i18n]);

  /**
   * Effect: Language persistence
   *
   * Saves the current language to localStorage whenever it changes.
   * This ensures the user's language preference persists across sessions.
   */
  useEffect(() => {
    if (i18n.language) {
      localStorage.setItem("i18nextLng", i18n.language);
    }
  }, [i18n.language]);

  return i18n.language;
}
