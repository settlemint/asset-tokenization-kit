import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { optionalString } from "../../src/utils/optional-string";
import { isin } from "../../src/validators/isin";

describe("optionalString", () => {
  it("should accept valid values", () => {
    const schema = optionalString(z.string().min(3).max(10));
    expect(schema.parse("hello")).toBe("hello");
  });

  it("should accept empty strings", () => {
    const schema = optionalString(z.string().min(3).max(10));
    expect(schema.parse("")).toBe("");
  });

  it("should accept null", () => {
    const schema = optionalString(z.string().min(3).max(10));
    expect(schema.parse(null)).toBe(null);
  });

  it("should accept undefined", () => {
    const schema = optionalString(z.string().min(3).max(10));
    const result = schema.safeParse(undefined);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it("should reject invalid values", () => {
    const schema = optionalString(z.string().min(3).max(10));
    expect(() => schema.parse("ab")).toThrow(); // Too short
    expect(() => schema.parse("this is too long")).toThrow(); // Too long
  });

  it("should work with custom validators like isin", () => {
    const schema = optionalString(isin());

    // Valid ISIN
    expect(schema.parse("US0378331005")).toBe("US0378331005");

    // Empty string
    expect(schema.parse("")).toBe("");

    // Null
    expect(schema.parse(null)).toBe(null);

    // Undefined
    const undefinedResult = schema.safeParse(undefined);
    expect(undefinedResult.success).toBe(true);
    if (undefinedResult.success) {
      expect(undefinedResult.data).toBeUndefined();
    }

    // Invalid ISIN
    expect(() => schema.parse("INVALID")).toThrow();
  });
});
