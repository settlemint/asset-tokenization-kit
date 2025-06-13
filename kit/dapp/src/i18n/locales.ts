export const allowedLocales = ["en", "de", "ja", "ar"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof allowedLocales)[number];
