import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "../../../locales/en.json";
import deTranslations from "../../../locales/de.json";
import "./types";

export const defaultNS = "translation";
export const resources = {
  en: {
    translation: enTranslations,
  },
  de: {
    translation: deTranslations,
  },
} as const;

export const supportedLanguages = Object.keys(resources);
export const fallbackLng = "en";

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

export default i18n;