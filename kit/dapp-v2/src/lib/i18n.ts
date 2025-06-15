import de from "@/locales/de.json";
import en from "@/locales/en.json";
import { createTranslation } from "intl-t/react"; // intl-t/core | intl-t/react | intl-t/next. Default is core

const translation = createTranslation({
  locales: { en, de }, // It will be notify an Error in case of any difference between translation structure
  mainLocale: "en",
  // other settings like default variables, replacement placeholder strings, preferences, etc...
});

export const {
  useTranslation,
  getTranslation,
  settings,
  t,
  Translation,
  useLocale,
} = translation; // translation is t itself. t contains the t object. (t.t)
