import { describe, expect, test } from "vitest";
import {
  equityClass,
  equityClasses,
  getEquityClass,
  isEquityClass,
  type EquityClass,
} from "./equity-classes";

describe("equity-classes", () => {
  describe("equityClass validator", () => {
    const validator = equityClass();

    describe("valid equity classes", () => {
      test.each(equityClasses.map((c) => [c]))("should accept '%s'", (cls) => {
        expect(validator.parse(cls)).toBe(cls);
      });
    });

    describe("invalid equity classes", () => {
      test("should reject invalid strings", () => {
        expect(() => validator.parse("D")).toThrow();
        expect(() => validator.parse("X")).toThrow();
        expect(() => validator.parse("")).toThrow();
      });

      test("should reject lowercase letters", () => {
        expect(() => validator.parse("a")).toThrow();
        expect(() => validator.parse("b")).toThrow();
        expect(() => validator.parse("c")).toThrow();
      });

      test("should reject multiple characters", () => {
        expect(() => validator.parse("AA")).toThrow();
        expect(() => validator.parse("AB")).toThrow();
        expect(() => validator.parse("Class A")).toThrow();
      });

      test("should reject non-string types", () => {
        expect(() => validator.parse(1)).toThrow();
        expect(() => validator.parse(null)).toThrow();
        expect(() => validator.parse(undefined)).toThrow();
        expect(() => validator.parse({})).toThrow();
        expect(() => validator.parse([])).toThrow();
        expect(() => validator.parse(true)).toThrow();
        expect(() => validator.parse(false)).toThrow();
      });
    });

    describe("safeParse", () => {
      test("should return success for valid class", () => {
        const result = validator.safeParse("A");
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe("A");
        }
      });

      test("should return error for invalid class", () => {
        const result = validator.safeParse("D");
        expect(result.success).toBe(false);
      });
    });

    describe("schema description", () => {
      test("should have the correct description", () => {
        expect(validator.description).toBe("Class of equity shares");
      });
    });
  });

  describe("isEquityClass type guard", () => {
    describe("valid values", () => {
      test.each(equityClasses)("should return true for '%s'", (cls) => {
        expect(isEquityClass(cls)).toBe(true);
      });
    });

    describe("invalid values", () => {
      test("should return false for invalid strings", () => {
        expect(isEquityClass("D")).toBe(false);
        expect(isEquityClass("X")).toBe(false);
        expect(isEquityClass("")).toBe(false);
        expect(isEquityClass("Common")).toBe(false);
      });

      test("should return false for lowercase variants", () => {
        expect(isEquityClass("a")).toBe(false);
        expect(isEquityClass("b")).toBe(false);
        expect(isEquityClass("c")).toBe(false);
      });

      test("should return false for non-string types", () => {
        expect(isEquityClass(1)).toBe(false);
        expect(isEquityClass(null)).toBe(false);
        expect(isEquityClass(undefined)).toBe(false);
        expect(isEquityClass({})).toBe(false);
        expect(isEquityClass([])).toBe(false);
        expect(isEquityClass(true)).toBe(false);
        expect(isEquityClass(false)).toBe(false);
        expect(isEquityClass(Symbol("A"))).toBe(false);
        expect(isEquityClass(BigInt(1))).toBe(false);
      });

      test("should return false for objects with toString", () => {
        const objWithToString = {
          toString() {
            return "A";
          },
        };
        expect(isEquityClass(objWithToString)).toBe(false);
      });
    });

    describe("type narrowing", () => {
      test("should properly narrow types", () => {
        const unknownValue: unknown = "B";
        if (isEquityClass(unknownValue)) {
          // TypeScript should know unknownValue is EquityClass here
          const equityClassValue: EquityClass = unknownValue;
          expect(equityClassValue).toBe("B");
        } else {
          // This branch should not be reached
          expect(true).toBe(false);
        }
      });
    });
  });

  describe("getEquityClass", () => {
    describe("valid values", () => {
      test.each(equityClasses)("should return '%s' for valid input", (cls) => {
        expect(getEquityClass(cls)).toBe(cls);
      });
    });

    describe("invalid values", () => {
      test("should throw for invalid strings", () => {
        expect(() => getEquityClass("D")).toThrow();
        expect(() => getEquityClass("X")).toThrow();
        expect(() => getEquityClass("")).toThrow();
        expect(() => getEquityClass("Common")).toThrow();
      });

      test("should throw for lowercase variants", () => {
        expect(() => getEquityClass("a")).toThrow();
        expect(() => getEquityClass("b")).toThrow();
        expect(() => getEquityClass("c")).toThrow();
      });

      test("should throw for non-string types", () => {
        expect(() => getEquityClass(1)).toThrow();
        expect(() => getEquityClass(null)).toThrow();
        expect(() => getEquityClass(undefined)).toThrow();
        expect(() => getEquityClass({})).toThrow();
        expect(() => getEquityClass([])).toThrow();
        expect(() => getEquityClass(true)).toThrow();
        expect(() => getEquityClass(false)).toThrow();
      });

      test("should throw with correct Zod error", () => {
        try {
          getEquityClass("InvalidClass");
          // Should not reach here
          expect(true).toBe(false);
        } catch (error) {
          expect(error).toBeDefined();
          // Verify it's a Zod validation error
          expect(error).toHaveProperty("issues");
        }
      });
    });

    describe("return type", () => {
      test("should return the correct type", () => {
        const result = getEquityClass("A");
        const typedResult: EquityClass = result;
        expect(typedResult).toBe("A");
      });
    });
  });

  describe("equityClasses constant", () => {
    test("should contain exactly three classes", () => {
      expect(equityClasses).toHaveLength(3);
      expect(equityClasses).toEqual(["A", "B", "C"]);
    });

    test("should be readonly", () => {
      // TypeScript ensures this at compile time through 'as const'
      // The array itself is not frozen at runtime, but TypeScript prevents modification
      expect(equityClasses).toEqual(["A", "B", "C"]);
      // Verify it's an array
      expect(Array.isArray(equityClasses)).toBe(true);
    });
  });

  describe("EquityClass type", () => {
    test("should only accept valid equity classes", () => {
      // These are compile-time checks, but we can test runtime behavior
      const validA: EquityClass = "A";
      const validB: EquityClass = "B";
      const validC: EquityClass = "C";

      expect(validA).toBe("A");
      expect(validB).toBe("B");
      expect(validC).toBe("C");
    });
  });

  describe("edge cases and boundaries", () => {
    test("should handle empty string inputs", () => {
      expect(() => equityClass().parse("")).toThrow();
      expect(isEquityClass("")).toBe(false);
      expect(() => getEquityClass("")).toThrow();
    });

    test("should handle whitespace", () => {
      expect(() => equityClass().parse(" A")).toThrow();
      expect(() => equityClass().parse("A ")).toThrow();
      expect(() => equityClass().parse(" A ")).toThrow();
      expect(isEquityClass(" A")).toBe(false);
      expect(isEquityClass("A ")).toBe(false);
    });

    test("should handle special characters", () => {
      expect(() => equityClass().parse("A+")).toThrow();
      expect(() => equityClass().parse("A-")).toThrow();
      expect(() => equityClass().parse("A.")).toThrow();
      expect(isEquityClass("A+")).toBe(false);
      expect(isEquityClass("A-")).toBe(false);
    });

    test("should handle unicode characters", () => {
      expect(() => equityClass().parse("Ａ")).toThrow(); // Full-width A
      expect(() => equityClass().parse("А")).toThrow(); // Cyrillic A
      expect(isEquityClass("Ａ")).toBe(false);
      expect(isEquityClass("А")).toBe(false);
    });
  });
});
