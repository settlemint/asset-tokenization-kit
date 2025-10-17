import { describe, it, expect } from "vitest";
import { themeConfigSchema, DEFAULT_THEME } from "./schema";

describe("theme repository security", () => {
  describe("JSON.parse and schema validation", () => {
    it("should reject malformed JSON", () => {
      const malformedJson = "{invalid json";
      expect(() => JSON.parse(malformedJson)).toThrow();
    });

    it("should reject invalid schema after JSON.parse", () => {
      const invalidData = JSON.stringify({ invalid: "schema" });
      const parsed = JSON.parse(invalidData);
      const result = themeConfigSchema.safeParse(parsed);
      expect(result.success).toBe(false);
    });

    it("should accept valid theme after JSON.parse", () => {
      const validJson = JSON.stringify(DEFAULT_THEME);
      const parsed = JSON.parse(validJson);
      const result = themeConfigSchema.safeParse(parsed);
      expect(result.success).toBe(true);
    });

    it("should handle nested invalid data", () => {
      const nestedInvalid = JSON.stringify({
        ...DEFAULT_THEME,
        cssVars: {
          light: { primary: "not-a-color" },
          dark: { primary: "not-a-color" },
        },
      });
      const parsed = JSON.parse(nestedInvalid);
      const result = themeConfigSchema.safeParse(parsed);
      expect(result.success).toBe(false);
    });

    it("should validate version incrementing logic", () => {
      const theme = {
        ...DEFAULT_THEME,
        metadata: {
          ...DEFAULT_THEME.metadata,
          version: 5,
        },
      };

      const updated = {
        ...theme,
        metadata: {
          ...theme.metadata,
          version: theme.metadata.version + 1,
          updatedBy: "test-user",
          updatedAt: new Date().toISOString(),
        },
      };

      expect(updated.metadata.version).toBe(6);
      expect(updated.metadata.updatedBy).toBe("test-user");

      const result = themeConfigSchema.safeParse(updated);
      expect(result.success).toBe(true);
    });
  });
});
