import { createTranslation } from "intl-t/next";
import { allowedLocales, type Locale } from "./locales";
import "./patch";

// Define the type from the English translation file
type LocaleData = typeof import("../../messages/en.json");

export const {
  Translation,
  useTranslation,
  getTranslation,
  useTranslations,
  getTranslations,
} = await createTranslation({
  allowedLocales: [...allowedLocales],
  locales: (locale) =>
    import(`../../messages/${locale}.json`) as Promise<LocaleData>,
});

// Export aliases for easier migration from next-intl
export { getTranslation as getT, useTranslation as useT };

// Export the Locale type for compatibility
export type { Locale };

// Export locale functions for compatibility
export const useLocale = () => {
  const { Translation } = useTranslation();
  return Translation.locale;
};

export const getLocale = () => {
  const { Translation } = getTranslation();
  return Translation.locale;
};

// Export formatter functions and types for compatibility with date/number utilities
export type DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export interface FormatterConfig {
  locale?: Locale;
  timeZone?: string;
  formats?: {
    number?: {
      currency?: Intl.NumberFormatOptions;
      percent?: Intl.NumberFormatOptions;
    };
  };
}

export const createFormatter = (config: FormatterConfig = {}) => {
  const locale = config.locale || "en";
  const timeZone =
    config.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    dateTime: (date: Date, options?: DateTimeFormatOptions) => {
      return new Intl.DateTimeFormat(locale, {
        timeZone,
        ...options,
      }).format(date);
    },
    number: (value: number, options?: Intl.NumberFormatOptions) => {
      return new Intl.NumberFormat(locale, options).format(value);
    },
  };
};

export const useFormatter = () => {
  const locale = useLocale();
  return createFormatter({ locale });
};
