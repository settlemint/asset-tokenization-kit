import { describe, it, expect } from "vitest";
import {
  ThemeLogoUploadSchema,
  ThemeLogoUploadOutputSchema,
} from "./theme.upload-logo.schema";

describe("theme logo upload schema", () => {
  it("accepts valid payload", () => {
    const bucket = "atk";
    const input = {
      mode: "light" as const,
      fileName: "logo.svg",
      contentType: "image/svg+xml" as const,
      fileSize: 1024,
      previousUrl: `/${bucket}/logos/light/old.svg`,
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
    };
    const parsed = ThemeLogoUploadSchema.safeParse(input);
    expect(parsed.success).toBe(false);
  });

  it("validates output payload", () => {
    const bucket = "atk";
    const output = {
      mode: "light" as const,
      bucket,
      objectKey: "logos/light/logo.svg",
      publicUrl: `/${bucket}/logos/light/logo.svg`,
      uploadUrl: "https://minio.example.com/presigned",
      method: "PUT" as const,
      headers: {
        "Content-Type": "image/svg+xml",
      },
      expiresAt: new Date().toISOString(),
    };
    const parsed = ThemeLogoUploadOutputSchema.safeParse(output);
    expect(parsed.success).toBe(true);
  });
});
