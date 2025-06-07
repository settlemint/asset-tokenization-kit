import { describe, expect, it } from "bun:test";
import { duration, getDuration, isDuration, type Duration } from "./duration";

describe("duration", () => {
  const validator = duration();

  describe("valid durations", () => {
    it("should accept positive integers", () => {
      expect(validator.parse(1)).toBe(getDuration(1));
      expect(validator.parse(1000)).toBe(getDuration(1000));
      expect(validator.parse(60000)).toBe(getDuration(60000)); // 1 minute
      expect(validator.parse(3600000)).toBe(getDuration(3600000)); // 1 hour

      expect(isDuration(1)).toBe(true);
      expect(isDuration(1000)).toBe(true);
      expect(isDuration(60000)).toBe(true);
      expect(isDuration(3600000)).toBe(true);

      expect(getDuration(1)).toBe(getDuration(1));
      expect(getDuration(1000)).toBe(getDuration(1000));
      expect(getDuration(60000)).toBe(getDuration(60000));
      expect(getDuration(3600000)).toBe(getDuration(3600000));
    });

    it("should accept very large durations", () => {
      expect(validator.parse(86400000)).toBe(getDuration(86400000)); // 1 day
      expect(validator.parse(604800000)).toBe(getDuration(604800000)); // 1 week
      expect(validator.parse(2592000000)).toBe(getDuration(2592000000)); // 30 days

      expect(isDuration(86400000)).toBe(true);
      expect(isDuration(604800000)).toBe(true);
      expect(isDuration(2592000000)).toBe(true);

      expect(getDuration(86400000)).toBe(getDuration(86400000));
      expect(getDuration(604800000)).toBe(getDuration(604800000));
      expect(getDuration(2592000000)).toBe(getDuration(2592000000));
    });

    it("should accept the smallest positive duration", () => {
      expect(validator.parse(1)).toBe(getDuration(1));
      expect(isDuration(1)).toBe(true);
      expect(getDuration(1)).toBe(getDuration(1));
    });
  });

  describe("invalid durations", () => {
    it("should reject zero", () => {
      expect(() => validator.parse(0)).toThrow(
        "Duration must be greater than zero"
      );
      expect(isDuration(0)).toBe(false);
      expect(() => getDuration(0)).toThrow(
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

      expect(isDuration(-1)).toBe(false);
      expect(isDuration(-1000)).toBe(false);

      expect(() => getDuration(-1)).toThrow(
        "Duration must be greater than zero"
      );
      expect(() => getDuration(-1000)).toThrow(
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

      expect(isDuration(1.5)).toBe(false);
      expect(isDuration(1000.1)).toBe(false);
      expect(isDuration(999.999)).toBe(false);

      expect(() => getDuration(1.5)).toThrow(
        "Duration must be a whole number of milliseconds"
      );
      expect(() => getDuration(1000.1)).toThrow(
        "Duration must be a whole number of milliseconds"
      );
      expect(() => getDuration(999.999)).toThrow(
        "Duration must be a whole number of milliseconds"
      );
    });

    it("should reject non-numeric types", () => {
      expect(() => validator.parse("1000")).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();

      expect(isDuration("1000")).toBe(false);
      expect(isDuration(null)).toBe(false);
      expect(isDuration(undefined)).toBe(false);
      expect(isDuration({})).toBe(false);

      expect(() => getDuration("1000")).toThrow();
      expect(() => getDuration(null)).toThrow();
      expect(() => getDuration(undefined)).toThrow();
      expect(() => getDuration({})).toThrow();
    });

    it("should reject special numeric values", () => {
      expect(() => validator.parse(NaN)).toThrow();
      expect(() => validator.parse(Infinity)).toThrow();
      expect(() => validator.parse(-Infinity)).toThrow();

      expect(isDuration(NaN)).toBe(false);
      expect(isDuration(Infinity)).toBe(false);
      expect(isDuration(-Infinity)).toBe(false);

      expect(() => getDuration(NaN)).toThrow();
      expect(() => getDuration(Infinity)).toThrow();
      expect(() => getDuration(-Infinity)).toThrow();
    });
  });

  describe("common duration conversions", () => {
    it("should represent common time units correctly", () => {
      const second = 1000;
      const minute = 60 * second;
      const hour = 60 * minute;
      const day = 24 * hour;

      expect(validator.parse(second)).toBe(getDuration(second));
      expect(validator.parse(minute)).toBe(getDuration(minute));
      expect(validator.parse(hour)).toBe(getDuration(hour));
      expect(validator.parse(day)).toBe(getDuration(day));

      expect(isDuration(second)).toBe(true);
      expect(isDuration(minute)).toBe(true);
      expect(isDuration(hour)).toBe(true);
      expect(isDuration(day)).toBe(true);

      expect(getDuration(second)).toBe(getDuration(second));
      expect(getDuration(minute)).toBe(getDuration(minute));
      expect(getDuration(hour)).toBe(getDuration(hour));
      expect(getDuration(day)).toBe(getDuration(day));
    });
  });

  describe("safeParse", () => {
    it("should return success for valid duration", () => {
      const result = validator.safeParse(1000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(getDuration(1000));
      }
    });

    it("should return error for invalid duration", () => {
      const result = validator.safeParse(0);
      expect(result.success).toBe(false);
    });
  });

  describe("helper functions", () => {
    it("isDuration should work as type guard", () => {
      const value: unknown = 1000;
      if (isDuration(value)) {
        // TypeScript should recognize value as Duration here
        const _typeCheck: Duration = value;
      }
    });

    it("getDuration should return typed value", () => {
      const result = getDuration(60000);
      // TypeScript should recognize result as Duration
      const _typeCheck: Duration = result;
      expect(result).toBe(getDuration(60000));
    });
  });
});
