import { describe, expect, it } from "bun:test";
import {
  equityClass,
  equityClasses,
  getEquityClass,
  isEquityClass,
} from "./equity-classes";

describe("equityClass", () => {
  const validator = equityClass();

  describe("valid equity classes", () => {
    it.each(equityClasses.map((c) => [c]))("should accept '%s'", (cls) => {
      expect(validator.parse(cls)).toBe(getEquityClass(cls));
      expect(isEquityClass(cls)).toBe(true);
      expect(getEquityClass(cls)).toBe(getEquityClass(cls));
    });
  });

  describe("invalid equity classes", () => {
    it("should reject invalid strings", () => {
      expect(() => validator.parse("D")).toThrow();
      expect(() => validator.parse("X")).toThrow();
      expect(() => validator.parse("")).toThrow();

      expect(isEquityClass("D")).toBe(false);
      expect(isEquityClass("X")).toBe(false);
      expect(isEquityClass("")).toBe(false);

      expect(() => getEquityClass("D")).toThrow();
      expect(() => getEquityClass("X")).toThrow();
      expect(() => getEquityClass("")).toThrow();
    });

    it("should reject lowercase letters", () => {
      expect(() => validator.parse("a")).toThrow();
      expect(() => validator.parse("b")).toThrow();
      expect(() => validator.parse("c")).toThrow();

      expect(isEquityClass("a")).toBe(false);
      expect(isEquityClass("b")).toBe(false);
      expect(isEquityClass("c")).toBe(false);

      expect(() => getEquityClass("a")).toThrow();
      expect(() => getEquityClass("b")).toThrow();
      expect(() => getEquityClass("c")).toThrow();
    });

    it("should reject multiple characters", () => {
      expect(() => validator.parse("AA")).toThrow();
      expect(() => validator.parse("AB")).toThrow();
      expect(() => validator.parse("Class A")).toThrow();

      expect(isEquityClass("AA")).toBe(false);
      expect(isEquityClass("AB")).toBe(false);
      expect(isEquityClass("Class A")).toBe(false);

      expect(() => getEquityClass("AA")).toThrow();
      expect(() => getEquityClass("AB")).toThrow();
      expect(() => getEquityClass("Class A")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(1)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isEquityClass(1)).toBe(false);
      expect(isEquityClass(null)).toBe(false);
      expect(isEquityClass(undefined)).toBe(false);
      expect(isEquityClass({})).toBe(false);

      expect(() => getEquityClass(1)).toThrow(
        "Expected 'A' | 'B' | 'C', received number"
      );
      expect(() => getEquityClass(null)).toThrow(
        "Expected 'A' | 'B' | 'C', received null"
      );
      expect(() => getEquityClass(undefined)).toThrow("Required");
      expect(() => getEquityClass({})).toThrow(
        "Expected 'A' | 'B' | 'C', received object"
      );
    });
  });

  describe("safeParse", () => {
    it("should return success for valid class", () => {
      const result = validator.safeParse("A");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getEquityClass("A"));
      }
    });

    it("should return error for invalid class", () => {
      const result = validator.safeParse("D");
      expect(result.success).toBe(false);
    });
  });

  describe("helper functions", () => {
    it("isEquityClass should work as type guard", () => {
      const value: unknown = "B";
      if (isEquityClass(value)) {
        // TypeScript should recognize value as EquityClass here
        const _typeCheck: "A" | "B" | "C" = value;
      }
    });

    it("getEquityClass should return typed value", () => {
      const result = getEquityClass("C");
      // TypeScript should recognize result as EquityClass
      const _typeCheck: "A" | "B" | "C" = result;
      expect(result).toBe(getEquityClass("C"));
    });
  });
});
