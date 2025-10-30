import { safeCssBackgroundImage } from "@/lib/utils/css-url";
import type { ThemeConfig } from "../lib/schema";

type ThemeMode = keyof ThemeConfig["cssVars"];

export function resolveAuthLogoSrc(
  theme: ThemeConfig,
  mode: ThemeMode
): string {
  const authKey = mode === "light" ? "authLightUrl" : "authDarkUrl";
  const logoKey = mode === "light" ? "lightUrl" : "darkUrl";
  const fallback =
    mode === "light"
      ? "/logos/settlemint-logo-h-lm.svg"
      : "/logos/settlemint-logo-h-dm.svg";

  const trimmedAuth = (theme.images[authKey] as string)?.trim() ?? "";
  if (trimmedAuth) return trimmedAuth;

  const trimmedLogo = (theme.logo[logoKey] as string)?.trim() ?? "";
  return trimmedLogo || fallback;
}

export function resolveBackgroundImage(
  theme: ThemeConfig,
  mode: ThemeMode
): string {
  const key = mode === "light" ? "backgroundLightUrl" : "backgroundDarkUrl";
  const fallback =
    mode === "light"
      ? "/backgrounds/background-lm.svg"
      : "/backgrounds/background-dm.svg";

  const rawValue = theme.images[key];
  const trimmedValue = typeof rawValue === "string" ? rawValue.trim() : "";

  if (trimmedValue.length > 0) {
    return safeCssBackgroundImage(trimmedValue);
  }

  return safeCssBackgroundImage(fallback);
}
