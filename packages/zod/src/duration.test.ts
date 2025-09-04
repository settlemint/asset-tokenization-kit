import { describe, expect, it } from "bun:test";
import { duration, getDuration, isDuration } from "./duration";

describe("duration", () => {
  const validator = duration();

  describe("valid durations", () => {
    it("should accept positive integers", () => {
      expect(validator.parse(1)).toBe(1);
      expect(validator.parse(1000)).toBe(1000);
      expect(validator.parse(60_000)).toBe(60_000); // 1 minute
      expect(validator.parse(3_600_000)).toBe(3_600_000); // 1 hour
    });

    it("should accept very large durations", () => {
      expect(validator.parse(86_400_000)).toBe(86_400_000); // 1 day
      expect(validator.parse(604_800_000)).toBe(604_800_000); // 1 week
      expect(validator.parse(2_592_000_000)).toBe(2_592_000_000); // 30 days
    });

    it("should accept the smallest positive duration", () => {
      expect(validator.parse(1)).toBe(1);
    });
  });

  describe("invalid durations", () => {
    it("should reject zero", () => {
      expect(() => validator.parse(0)).toThrow(
        "Duration must be greater than zero"
      );
    });

    it("should reject negative numbers", () => {
      expect(() => validator.parse(-1)).toThrow(
        "Duration must be greater than zero"
      );
      expect(() => validator.parse(-1000)).toThrow(
        "Duration must be greater than zero"
      );
    });

    it("should reject non-integer values", () => {
      expect(() => validator.parse(1.5)).toThrow(
        "Duration must be a whole number of milliseconds"
      );
      expect(() => validator.parse(1000.1)).toThrow(
        "Duration must be a whole number of milliseconds"
      );
      expect(() => validator.parse(999.999)).toThrow(
        "Duration must be a whole number of milliseconds"
      );
    });

    it("should reject non-numeric types", () => {
      expect(() => validator.parse("1000")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should reject special numeric values", () => {
      expect(() => validator.parse(Number.NaN)).toThrow();
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();
    });
  });

  describe("common duration conversions", () => {
    it("should represent common time units correctly", () => {
      const second = 1000;
      const minute = 60 * second;
      const hour = 60 * minute;
      const day = 24 * hour;

      expect(validator.parse(second)).toBe(second);
      expect(validator.parse(minute)).toBe(minute);
      expect(validator.parse(hour)).toBe(hour);
      expect(validator.parse(day)).toBe(day);
    });
  });

  describe("safeParse", () => {
    it("should return success for valid duration", () => {
      const result = validator.safeParse(1000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(1000);
      }
    });

    it("should return error for invalid duration", () => {
      const result = validator.safeParse(0);
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse(60_000);
      // Test that the type is correctly inferred
      expect(result).toBe(60_000);
    });
  });

  describe("isDuration", () => {
    it("should return true for valid durations", () => {
      expect(isDuration(1)).toBe(true);
      expect(isDuration(1000)).toBe(true);
      expect(isDuration(60_000)).toBe(true);
      expect(isDuration(3_600_000)).toBe(true);
      expect(isDuration(86_400_000)).toBe(true);
    });

    it("should return false for invalid durations", () => {
      // Non-positive numbers
      expect(isDuration(0)).toBe(false);
      expect(isDuration(-1)).toBe(false);
      expect(isDuration(-1000)).toBe(false);

      // Non-integer numbers
      expect(isDuration(1.5)).toBe(false);
      expect(isDuration(1000.1)).toBe(false);
      expect(isDuration(999.999)).toBe(false);

      // Non-numeric types
      expect(isDuration("1000")).toBe(false);
      expect(isDuration(null)).toBe(false);
      expect(isDuration(undefined)).toBe(false);
      expect(isDuration({})).toBe(false);
      expect(isDuration([])).toBe(false);
      expect(isDuration(true)).toBe(false);
      expect(isDuration(false)).toBe(false);

      // Special numeric values
      expect(isDuration(Number.NaN)).toBe(false);
      expect(isDuration(Infinity)).toBe(false);
      expect(isDuration(-Infinity)).toBe(false);
    });

    it("should work as a type guard", () => {
      const unknownValue: unknown = 5000;
      if (isDuration(unknownValue)) {
        // TypeScript should know unknownValue is Duration here
        const seconds: number = unknownValue / 1000;
        expect(seconds).toBe(5);
      }
    });
  });

  describe("getDuration", () => {
    it("should return valid durations", () => {
      expect(getDuration(1)).toBe(1);
      expect(getDuration(1000)).toBe(1000);
      expect(getDuration(60_000)).toBe(60_000);
      expect(getDuration(3_600_000)).toBe(3_600_000);
    });

    it("should throw for zero", () => {
      expect(() => getDuration(0)).toThrow(
        "Duration must be greater than zero"
      );
    });

    it("should throw for negative numbers", () => {
      expect(() => getDuration(-1)).toThrow(
        "Duration must be greater than zero"
      );
      expect(() => getDuration(-1000)).toThrow(
        "Duration must be greater than zero"
      );
    });

    it("should throw for non-integer values", () => {
      expect(() => getDuration(1.5)).toThrow(
        "Duration must be a whole number of milliseconds"
      );
      expect(() => getDuration(1000.1)).toThrow(
        "Duration must be a whole number of milliseconds"
      );
    });

    it("should throw for non-numeric types", () => {
      expect(() => getDuration("1000")).toThrow(
        "Invalid input: expected number, received string"
      );
      expect(() => getDuration(null)).toThrow(
        "Invalid input: expected number, received null"
      );
      expect(() => getDuration(undefined)).toThrow(
        "Invalid input: expected number, received undefined"
      );
      expect(() => getDuration({})).toThrow(
        "Invalid input: expected number, received object"
      );
      expect(() => getDuration([])).toThrow(
        "Invalid input: expected number, received array"
      );
      expect(() => getDuration(true)).toThrow(
        "Invalid input: expected number, received boolean"
      );
    });

    it("should throw for special numeric values", () => {
      expect(() => getDuration(Number.NaN)).toThrow(
        "Invalid input: expected number, received NaN"
      );
      expect(() => getDuration(Infinity)).toThrow(
        "Invalid input: expected number, received number"
      );
      expect(() => getDuration(-Infinity)).toThrow(
        "Invalid input: expected number, received number"
      );
    });

    it("should handle edge cases", () => {
      // Maximum safe integer
      const maxSafeInt = Number.MAX_SAFE_INTEGER;
      expect(getDuration(maxSafeInt)).toBe(maxSafeInt);

      // Just below maximum safe integer
      expect(getDuration(maxSafeInt - 1)).toBe(maxSafeInt - 1);
    });

    it("should work with different error handling patterns", () => {
      // Try-catch pattern
      try {
        getDuration(0);
        throw new Error("Should have thrown");
      } catch (error) {
        expect(error).toBeDefined();
      }

      // Direct validation check
      const result = duration().safeParse(5000);
      if (result.success) {
        expect(getDuration(result.data)).toBe(5000);
      }
    });
  });

  describe("integration scenarios", () => {
    it("should work with isDuration and getDuration together", () => {
      const values: unknown[] = [1000, "1000", 0, -1, 1.5, null];
      const validDurations: number[] = [];

      for (const value of values) {
        if (isDuration(value)) {
          validDurations.push(getDuration(value));
        }
      }

      expect(validDurations).toEqual([1000]);
    });

    it("should validate configuration objects", () => {
      interface Config {
        timeout?: unknown;
        interval?: unknown;
      }

      const config: Config = {
        timeout: 5000,
        interval: "1000", // Invalid
      };

      // Validate timeout
      if (isDuration(config.timeout)) {
        expect(config.timeout).toBe(5000);
      }

      // Validate interval
      expect(isDuration(config.interval)).toBe(false);
    });

    it("should handle array of potential durations", () => {
      const inputs = [100, 200, 0, -50, 1.5, "300", null, 400];
      const validDurations = inputs.filter((d) => isDuration(d));
      expect(validDurations).toEqual([100, 200, 400]);
    });
  });
});
