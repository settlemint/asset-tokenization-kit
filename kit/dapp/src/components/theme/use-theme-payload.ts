import type { ThemeConfig } from "@/components/theme/schema";

const resolveLogoBaseUrl = (): string => {
  if (globalThis.window !== undefined && globalThis.location?.origin) {
    return globalThis.location.origin;
  }
  const envOrigin =
    import.meta.env?.VITE_APP_URL ??
    import.meta.env?.NEXT_PUBLIC_APP_URL ??
    (typeof process === "undefined"
      ? undefined
      : process.env?.VITE_APP_URL ?? process.env?.NEXT_PUBLIC_APP_URL);
  return typeof envOrigin === "string" && envOrigin.length > 0
    ? envOrigin
    : "http://localhost:3000";
};

export const sanitizeLogoUrlForPayload = (
  url: string | undefined
): string | undefined => {
  if (!url) {
    return undefined;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  if (url.startsWith("/")) {
    try {
      return new URL(url, resolveLogoBaseUrl()).toString();
    } catch {
      return undefined;
    }
  }
  return undefined;
};

export const prepareThemePayload = (theme: ThemeConfig): ThemeConfig => {
  const payload = structuredClone(theme);
  payload.logo.lightUrl = sanitizeLogoUrlForPayload(payload.logo.lightUrl);
  payload.logo.darkUrl = sanitizeLogoUrlForPayload(payload.logo.darkUrl);
  return payload;
};
