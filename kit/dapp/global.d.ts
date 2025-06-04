import type formats from "@/i18n/request";
import type { routing } from "@/i18n/routing";
import type en from "./messages/en.json";

declare module "next-intl" {
  interface AppConfig {
    Messages: typeof en;
    Formats: typeof formats;
    Locale: (typeof routing.locales)[number];
  }
}

declare global {
  // eslint-disable-next-line no-var
  var $headers: (() => Promise<Headers>) | undefined;
}

export {};
