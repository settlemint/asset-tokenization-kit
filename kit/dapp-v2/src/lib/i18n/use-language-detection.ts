import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supportedLanguages, fallbackLng } from "./index";

export function useLanguageDetection() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Check if language is already set (e.g., from localStorage)
    const storedLang = localStorage.getItem("i18nextLng");
    if (storedLang && supportedLanguages.includes(storedLang)) {
      void i18n.changeLanguage(storedLang);
      return;
    }

    // Detect browser language
    const browserLang = navigator.language.split("-")[0];
    const detectedLang = browserLang && supportedLanguages.includes(browserLang)
      ? browserLang
      : fallbackLng;

    // Set detected language
    void i18n.changeLanguage(detectedLang);
  }, [i18n]);

  // Save language preference when it changes
  useEffect(() => {
    if (i18n.language) {
      localStorage.setItem("i18nextLng", i18n.language);
    }
  }, [i18n.language]);

  return i18n.language;
}