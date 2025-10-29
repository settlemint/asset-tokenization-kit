import { describe, expect, it } from "vitest";
import { safeCssBackgroundImage, sanitizeCssUrl } from "./css-url";

describe("sanitizeCssUrl", () => {
  it("should sanitize a plain URL", () => {
    const result = sanitizeCssUrl("/path/to/image.png");
    expect(result).toBe("/path/to/image.png");
  });

  it("should escape single quotes", () => {
    const result = sanitizeCssUrl("/path/with'quote.png");
    expect(result).toBe("/path/with\\'quote.png");
  });

  it("should escape double quotes", () => {
    const result = sanitizeCssUrl('/path/with"quote.png');
    expect(result).toBe('/path/with\\"quote.png');
  });

  it("should escape parentheses", () => {
    const result = sanitizeCssUrl("/path/with(parens).png");
    expect(result).toBe("/path/with\\(parens\\).png");
  });

  it("should escape backslashes", () => {
    const result = sanitizeCssUrl("/path/with\\backslash.png");
    expect(result).toBe("/path/with\\\\backslash.png");
  });

  it("should escape newlines", () => {
    const result = sanitizeCssUrl("/path/with\nnewline.png");
    expect(result).toBe("/path/with\\nnewline.png");
  });

  it("should escape carriage returns", () => {
    const result = sanitizeCssUrl("/path/with\rcarriage.png");
    expect(result).toBe("/path/with\\rcarriage.png");
  });

  it("should handle URLs already wrapped in url()", () => {
    const result = sanitizeCssUrl("url(/path/to/image.png)");
    expect(result).toBe("/path/to/image.png");
  });

  it("should handle URLs with quotes", () => {
    const result = sanitizeCssUrl("'/path/to/image.png'");
    expect(result).toBe("/path/to/image.png");
  });

  it("should handle URLs with double quotes", () => {
    const result = sanitizeCssUrl('"/path/to/image.png"');
    expect(result).toBe("/path/to/image.png");
  });

  it("should handle empty string", () => {
    const result = sanitizeCssUrl("");
    expect(result).toBe("");
  });

  it("should handle multiple special characters", () => {
    const result = sanitizeCssUrl("/path/with'quotes\"and(parens).png");
    expect(result).toBe("/path/with\\'quotes\\\"and\\(parens\\).png");
  });

  it("should handle HTTP URLs", () => {
    const result = sanitizeCssUrl("https://example.com/image.png");
    expect(result).toBe("https://example.com/image.png");
  });

  it("should handle data URLs", () => {
    const result = sanitizeCssUrl("data:image/svg+xml;base64,ABC123");
    expect(result).toBe("data:image/svg+xml;base64,ABC123");
  });
});

describe("safeCssBackgroundImage", () => {
  it("should wrap URL in url() with single quotes", () => {
    const result = safeCssBackgroundImage("/path/to/image.png");
    expect(result).toBe("url('/path/to/image.png')");
  });

  it("should escape special characters and wrap in url()", () => {
    const result = safeCssBackgroundImage("/path/with'quote.png");
    expect(result).toBe("url('/path/with\\'quote.png')");
  });

  it("should handle complex URLs", () => {
    const result = safeCssBackgroundImage(
      "https://example.com/path/to/image.png?v=1"
    );
    expect(result).toBe("url('https://example.com/path/to/image.png?v=1')");
  });

  it("should prevent CSS injection attempts", () => {
    const maliciousUrl = "'); alert('XSS'); ('";
    const result = safeCssBackgroundImage(maliciousUrl);
    expect(result).toBe("url('\\'\\); alert\\'XSS\\'\\); \\'')");
    // The escaped version should not execute any code
    expect(result).not.toContain("alert('XSS')");
  });

  it("should handle empty string", () => {
    const result = safeCssBackgroundImage("");
    expect(result).toBe("url('')");
  });
});
