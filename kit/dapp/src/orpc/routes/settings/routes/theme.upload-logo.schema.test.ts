import { describe, it, expect } from "vitest";
import {
  ThemeLogoUploadSchema,
  ThemeLogoUploadOutputSchema,
} from "./theme.upload-logo.schema";

describe("theme logo upload schema", () => {
  it("accepts valid payload", () => {
    const input = {
      mode: "light" as const,
      fileName: "logo.svg",
      contentType: "image/svg+xml" as const,
      fileSize: 1024,
      base64Data: "SGVsbG8=",
      previousUrl: "/branding/logos/light/old.svg",
    };
    const parsed = ThemeLogoUploadSchema.safeParse(input);
    expect(parsed.success).toBe(true);
  });

  it("rejects unsupported mime type", () => {
    const input = {
      mode: "dark" as const,
      fileName: "logo.gif",
      contentType: "image/gif",
      fileSize: 512,
      base64Data: "RkFLRQ==",
    };
    const parsed = ThemeLogoUploadSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates output payload", () => {
    const output = {
      mode: "light" as const,
      bucket: "branding",
      objectKey: "logos/light/logo.svg",
      publicUrl: "/branding/logos/light/logo.svg",
      etag: "abc123",
      updatedAt: new Date().toISOString(),
    };
    const parsed = ThemeLogoUploadOutputSchema.safeParse(output);
    expect(parsed.success).toBe(true);
  });
});
