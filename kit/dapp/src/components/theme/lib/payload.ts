import type { ThemeConfig } from "./schema";

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
    return url;
  }
  return undefined;
};

export const prepareThemePayload = (theme: ThemeConfig): ThemeConfig => {
  const payload = structuredClone(theme);
  payload.logo.lightUrl = sanitizeLogoUrlForPayload(payload.logo.lightUrl);
  payload.logo.darkUrl = sanitizeLogoUrlForPayload(payload.logo.darkUrl);
  payload.logo.lightIconUrl = sanitizeLogoUrlForPayload(
    payload.logo.lightIconUrl
  );
  payload.logo.darkIconUrl = sanitizeLogoUrlForPayload(
    payload.logo.darkIconUrl
  );
  return payload;
};
