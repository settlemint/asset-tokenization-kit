/**
 * @fileoverview Test suite for optionalString utility function
 *
 * This test suite validates the optionalString wrapper that makes string validators
 * accept nullish values and empty strings. Critical for form handling where:
 * - Browser sends empty strings for cleared inputs
 * - API endpoints may receive null/undefined for optional fields
 * - Validation should still apply to non-empty strings
 *
 * Key behaviors tested:
 * - Preserves original validator constraints for non-empty strings
 * - Bypasses validation for empty strings (form clearing behavior)
 * - Handles null/undefined gracefully (API optional field behavior)
 * - Works with complex validators like ISIN format validation
 */

import { describe, expect, it } from "bun:test";
import { z } from "zod";
import { isin } from "./isin";
import { optionalString } from "./optional-string";

describe("optionalString", () => {
  it("should accept valid values", () => {
    // WHY: Test that underlying validator constraints still apply to non-empty strings
    const schema = optionalString(z.string().min(3).max(10));
    expect(schema.parse("hello")).toBe("hello");
  });

  it("should accept empty strings", () => {
    // WHY: Form inputs send empty strings when cleared - should bypass validation
    const schema = optionalString(z.string().min(3).max(10));
    expect(schema.parse("")).toBe("");
  });

  it("should accept null", () => {
    // WHY: API endpoints may send null for optional fields - should bypass validation
    const schema = optionalString(z.string().min(3).max(10));
    expect(schema.parse(null)).toBe(null);
  });

  it("should accept undefined", () => {
    // WHY: TypeScript optional properties are undefined by default - should bypass validation
    const schema = optionalString(z.string().min(3).max(10));
    const res = schema.safeParse(undefined);
    expect(res.success).toBe(true);
    if (res.success) expect(res.data).toBeUndefined();
  });

  it("should reject invalid values", () => {
    // WHY: Non-empty strings must still satisfy original validator constraints
    const schema = optionalString(z.string().min(3).max(10));
    expect(() => schema.parse("ab")).toThrow(); // Too short - violates min(3)
    expect(() => schema.parse("this is too long")).toThrow(); // Too long - violates max(10)
  });

  it("should work with custom validators like isin", () => {
    // WHY: Demonstrate that complex validators (ISIN format) work correctly
    // ISIN has strict format requirements: 2-letter country + 9 alphanumeric + 1 check digit
    const schema = optionalString(isin());

    // Valid ISIN - Apple Inc. stock identifier
    expect(schema.parse("US0378331005")).toBe("US0378331005");

    // Empty string bypasses ISIN format validation
    expect(schema.parse("")).toBe("");

    // Null and undefined bypass ISIN format validation
    expect(schema.parse(null)).toBe(null);
    const res = schema.safeParse(undefined);
    expect(res.success).toBe(true);
    if (res.success) expect(res.data).toBeUndefined();

    // Invalid ISIN format should still throw
    expect(() => schema.parse("INVALID")).toThrow();
  });
});
