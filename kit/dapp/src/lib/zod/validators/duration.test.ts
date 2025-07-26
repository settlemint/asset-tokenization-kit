import { describe, expect, it } from "vitest";
import { duration } from "./duration";

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
});
