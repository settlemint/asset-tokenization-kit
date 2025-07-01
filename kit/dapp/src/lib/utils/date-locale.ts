import type { Locale } from "date-fns";
import { ar, de, enUS, ja } from "date-fns/locale";

type SupportedLocaleCode = "ar" | "de" | "en" | "ja";

const localeMap: Record<SupportedLocaleCode, Locale> = {
  ar,
  de,
  en: enUS,
  ja,
} as const;

export function getDateLocale(localeCode: string): Locale {
  const code = localeCode.split("-")[0];
  if (code && code in localeMap) {
    return localeMap[code as SupportedLocaleCode];
  }
  return localeMap.en;
}
