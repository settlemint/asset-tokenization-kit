import { describe, expect, it } from "vitest";
import { timestamp } from "./timestamp";

describe("timestamp", () => {
  const validator = timestamp();

  // Fixed dates for testing
  const testDate = new Date("2023-04-01T12:00:00Z");
  const testDateMs = 1_680_350_400_000; // Actual milliseconds for 2023-04-01T12:00:00Z
  const testDateSec = 1_680_350_400; // Seconds

  describe("Date object inputs", () => {
    it("should accept valid Date objects", () => {
      const result = validator.parse(testDate);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDateMs);
    });

    it("should reject invalid Date objects", () => {
      expect(() => validator.parse(new Date("invalid"))).toThrow();
    });
  });

  describe("ISO string inputs", () => {
    it("should accept ISO date strings", () => {
      const result = validator.parse("2023-04-01T12:00:00Z");
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDateMs);
    });

    it("should accept various ISO formats", () => {
      const formats = [
        "2023-04-01T12:00:00.000Z",
        "2023-04-01T12:00:00+00:00",
        "2023-04-01T12:00:00",
        "2023-04-01",
      ];

      formats.forEach((format) => {
        const result = validator.parse(format);
        expect(result).toBeInstanceOf(Date);
      });
    });

    it("should reject invalid date strings", () => {
      expect(() => validator.parse("not-a-date")).toThrow(
        "Invalid date string format"
      );
      expect(() => validator.parse("2023-13-01")).toThrow(
        "Invalid date string format"
      );
      expect(() => validator.parse("2023-04-32")).toThrow(
        "Invalid date string format"
      );
    });
  });

  describe("numeric inputs", () => {
    it("should accept millisecond timestamps", () => {
      const result = validator.parse(testDateMs);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDateMs);
    });

    it("should auto-detect and convert second timestamps", () => {
      const result = validator.parse(testDateSec);
      expect(result).toBeInstanceOf(Date);
      expect(result.getTime()).toBe(testDateMs);
    });

    it("should reject negative timestamps", () => {
      expect(() => validator.parse(-1)).toThrow("Timestamp cannot be negative");
    });

    it("should handle very large millisecond timestamps", () => {
      // Use a timestamp that's large but < 10000000000000 to avoid microsecond detection
      const year2286 = 9_999_999_999_999; // Just under the microsecond threshold
      const result = validator.parse(year2286);
      expect(result.getFullYear()).toBe(2286);
    });

    it("should handle microsecond timestamps", () => {
      // This will be treated as microseconds and result in an earlier date
      const microsecondTimestamp = 1_680_350_400_000_000; // Microseconds for our test date
      const result = validator.parse(microsecondTimestamp);
      expect(result.getTime()).toBe(testDateMs);
    });
  });

  describe("string timestamp inputs", () => {
    it("should parse 10-digit string as seconds", () => {
      const result = validator.parse("1680350400");
      expect(result.getTime()).toBe(testDateMs);
    });

    it("should parse 13-digit string as milliseconds", () => {
      const result = validator.parse("1680350400000");
      expect(result.getTime()).toBe(testDateMs);
    });

    it("should parse 16-digit string as microseconds", () => {
      const microseconds = "1680350400000000";
      const result = validator.parse(microseconds);
      expect(result.getTime()).toBe(testDateMs);
    });

    it("should parse 19-digit string as nanoseconds", () => {
      const nanoseconds = "1680350400000000000";
      const result = validator.parse(nanoseconds);
      expect(result.getTime()).toBe(testDateMs);
    });

    it("should handle edge cases for numeric strings", () => {
      // 9 digits - likely seconds
      const result1 = validator.parse("168035400");
      expect(result1.getTime()).toBe(168_035_400 * 1000);

      // 11 digits - ambiguous, treat as milliseconds
      const result2 = validator.parse("16803540000");
      expect(result2.getTime()).toBe(16_803_540_000);
    });

    it("should handle negative numeric string timestamps", () => {
      // Negative numeric strings don't match the /^\d+$/ pattern, so they're handled as regular date strings
      // "-1680350400" is invalid and throws
      expect(() => validator.parse("-1680350400")).toThrow(
        "Invalid date string format"
      );

      // However, "-1" is interpreted by JavaScript Date as year 2001 (weird but true)
      const result = validator.parse("-1");
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2001);
    });
  });

  describe("invalid inputs", () => {
    it("should reject non-date types", () => {
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
      expect(() => validator.parse([])).toThrow();
      expect(() => validator.parse(true)).toThrow();
    });

    it("should reject mixed content strings", () => {
      expect(() => validator.parse("123abc")).toThrow(
        "Invalid date string format"
      );
      expect(() => validator.parse("2023-04-01T12:00:00Z123")).toThrow();
    });

    it("should throw for invalid numeric timestamp string", () => {
      // Test a numeric string that's too large to be accurately represented
      // This will cause Number() to lose precision and the date parsing to fail
      expect(() => validator.parse("99999999999999999999999999")).toThrow();

      // Test an extremely large number that might cause issues
      const hugeNumber = "9".repeat(1000); // 1000 nines
      expect(() => validator.parse(hugeNumber)).toThrow();
    });

    it("should handle edge case where milliseconds value is passed directly", () => {
      // Test the specific branch for values >= 10000000000 and < 10000000000000
      const year2001InMs = 10_000_000_001; // Just over the threshold
      const result = validator.parse(year2001InMs);
      expect(result.getTime()).toBe(year2001InMs);
    });

    it("should reject dates outside valid range", () => {
      // Test date before Unix epoch
      expect(() => validator.parse(-1)).toThrow("Timestamp cannot be negative");

      // Test date after year 9999 using a string to avoid microsecond conversion
      const afterYear9999 = new Date(253_402_300_800_000);
      expect(() => validator.parse(afterYear9999)).toThrow(
        "Timestamp is out of valid range (must be between 1970 and 9999)"
      );
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("2023-04-01");
      // Test that the type is correctly inferred
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2023);
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse(1_680_350_400_000);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBeInstanceOf(Date);
        expect(result.data.getTime()).toBe(1_680_350_400_000);
      }
    });
  });
});
