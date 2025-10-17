import { Buffer } from "node:buffer";
import { cloneThemeConfig, THEME_TOKENS, type ThemeConfig } from "./schema";

const MAX_THEME_PAYLOAD_BYTES = 32 * 1024; // 32KB
const MAX_THEME_TOKENS = 128;
const MAX_LOGO_UPLOAD_BYTES = 500 * 1024; // 500KB

export type ThemeValidationIssue = {
  code: "PAYLOAD_TOO_LARGE" | "TOKEN_LIMIT_EXCEEDED" | "LOGO_TOO_LARGE";
  message: string;
  path?: string[];
};

function calculateDataUrlSize(dataUrl: string): number | null {
  if (!dataUrl.startsWith("data:")) {
    return null;
  }

  const commaIndex = dataUrl.indexOf(",");
  if (commaIndex === -1) {
    return null;
  }

  const payload = dataUrl.slice(commaIndex + 1);
  try {
    return Buffer.from(payload, "base64").byteLength;
  } catch {
    return null;
  }
}

export function validateThemeLimits(
  theme: ThemeConfig
): ThemeValidationIssue[] {
  const issues: ThemeValidationIssue[] = [];
  const payloadBytes = Buffer.byteLength(JSON.stringify(theme), "utf8");

  if (payloadBytes > MAX_THEME_PAYLOAD_BYTES) {
    issues.push({
      code: "PAYLOAD_TOO_LARGE",
      message: `Theme payload exceeds ${MAX_THEME_PAYLOAD_BYTES} bytes (actual: ${payloadBytes}).`,
    });
  }

  const lightTokens = Object.keys(theme.cssVars.light).length;
  const darkTokens = Object.keys(theme.cssVars.dark).length;
  const requiredTokens = THEME_TOKENS.length;

  if (lightTokens > MAX_THEME_TOKENS || darkTokens > MAX_THEME_TOKENS) {
    issues.push({
      code: "TOKEN_LIMIT_EXCEEDED",
      message: `Theme token count exceeds ${MAX_THEME_TOKENS} entries.`,
    });
  }

  if (lightTokens !== requiredTokens || darkTokens !== requiredTokens) {
    issues.push({
      code: "TOKEN_LIMIT_EXCEEDED",
      message: "Theme token count must match required token set.",
    });
  }

  const logoUrls = [theme.logo.lightUrl, theme.logo.darkUrl].filter(
    (url): url is string => typeof url === "string" && url.length > 0
  );

  for (const url of logoUrls) {
    const size = calculateDataUrlSize(url);
    if (size !== null && size > MAX_LOGO_UPLOAD_BYTES) {
      issues.push({
        code: "LOGO_TOO_LARGE",
        message: `Embedded logo exceeds ${MAX_LOGO_UPLOAD_BYTES} bytes (actual: ${size}).`,
        path: ["logo"],
      });
      break;
    }
  }

  return issues;
}

export function sanitizeThemeForValidation(theme: ThemeConfig): ThemeConfig {
  return cloneThemeConfig(theme);
}
