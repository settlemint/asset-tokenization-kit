import { Buffer } from "node:buffer";
import { describe, expect, it } from "vitest";
import { DEFAULT_THEME } from "./schema";
import { sanitizeThemeForValidation, validateThemeLimits } from "./validation";

describe("theme validation", () => {
  it("accepts default theme", () => {
    const issues = validateThemeLimits(DEFAULT_THEME);
    expect(issues).toHaveLength(0);
  });

  it("reports payloads exceeding 32KB", () => {
    const oversized = sanitizeThemeForValidation(DEFAULT_THEME);
    oversized.metadata.previewHash = "x".repeat(40_000);
    const issues = validateThemeLimits(oversized);
    expect(issues.some((issue) => issue.code === "PAYLOAD_TOO_LARGE")).toBe(
      true
    );
  });

  it("reports token count mismatches", () => {
    const faulty = sanitizeThemeForValidation(DEFAULT_THEME);
    // @ts-expect-error - deliberately violate schema at runtime
    delete faulty.cssVars.light.background;
    const issues = validateThemeLimits(faulty);
    expect(issues.some((issue) => issue.code === "TOKEN_LIMIT_EXCEEDED")).toBe(
      true
    );
  });

  it("reports embedded logos larger than 500KB", () => {
    const largeLogo = sanitizeThemeForValidation(DEFAULT_THEME);
    const buffer = Buffer.alloc(600 * 1024, 0);
    largeLogo.logo.lightUrl = `data:image/svg+xml;base64,${buffer.toString("base64")}`;

    const issues = validateThemeLimits(largeLogo);
    expect(issues.some((issue) => issue.code === "LOGO_TOO_LARGE")).toBe(true);
  });
});
