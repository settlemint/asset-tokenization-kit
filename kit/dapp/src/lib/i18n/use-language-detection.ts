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
    let storedLang: string | null = null;
    try {
      storedLang = localStorage.getItem("i18nextLng");
    } catch (error) {
      console.warn(
        "Failed to read language preference from localStorage:",
        error
      );
    }

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
   * Includes error handling for storage quota exceeded scenarios.
   */
  useEffect(() => {
    if (i18n.language) {
      try {
        localStorage.setItem("i18nextLng", i18n.language);
      } catch (error) {
        // Handle storage quota exceeded or other storage errors
        if (error instanceof Error && error.name === "QuotaExceededError") {
          console.warn(
            "Storage quota exceeded. Language preference will not be persisted."
          );
          // Clear old storage entries to make space
          try {
            const keys = Object.keys(localStorage);
            for (const key of keys) {
              if (
                key.startsWith("i18next") ||
                key.startsWith("vite-ui-theme")
              ) {
                localStorage.removeItem(key);
              }
            }
            // Retry setting the language
            localStorage.setItem("i18nextLng", i18n.language);
          } catch {
            console.warn(
              "Failed to clear storage and retry. Language preference will not be persisted."
            );
          }
        } else {
          console.warn(
            "Failed to save language preference to localStorage:",
            error
          );
        }
      }
    }
  }, [i18n.language]);

  return i18n.language;
}
