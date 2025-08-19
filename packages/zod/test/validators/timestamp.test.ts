import { describe, expect, it } from "bun:test";
import { getTimestamp, isTimestamp, timestamp, timestampSerializer } from "../../src/validators/timestamp";

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
      const formats = ["2023-04-01T12:00:00.000Z", "2023-04-01T12:00:00+00:00", "2023-04-01T12:00:00", "2023-04-01"];

      formats.forEach((format) => {
        const result = validator.parse(format);
        expect(result).toBeInstanceOf(Date);
      });
    });

    it("should reject invalid date strings", () => {
      expect(() => validator.parse("not-a-date")).toThrow("Invalid date string format");
      expect(() => validator.parse("2023-13-01")).toThrow("Invalid date string format");
      expect(() => validator.parse("2023-04-32")).toThrow("Invalid date string format");
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
      expect(() => validator.parse("-1680350400")).toThrow("Invalid date string format");

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
      expect(() => validator.parse("123abc")).toThrow("Invalid date string format");
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

describe("isTimestamp", () => {
  it("should return true for valid timestamps", () => {
    expect(isTimestamp(new Date())).toBe(true);
    expect(isTimestamp("2023-04-01T12:00:00Z")).toBe(true);
    expect(isTimestamp(1_680_350_400_000)).toBe(true);
    expect(isTimestamp(1_680_350_400)).toBe(true);
    expect(isTimestamp("1680350400000")).toBe(true);
    expect(isTimestamp("1680350400")).toBe(true);
    expect(isTimestamp("2023-04-01")).toBe(true);
  });

  it("should return false for invalid timestamps", () => {
    expect(isTimestamp("not-a-date")).toBe(false);
    expect(isTimestamp("2023-13-01")).toBe(false);
    expect(isTimestamp(-1)).toBe(false);
    expect(isTimestamp(null)).toBe(false);
    expect(isTimestamp(undefined)).toBe(false);
    expect(isTimestamp({})).toBe(false);
    expect(isTimestamp([])).toBe(false);
    expect(isTimestamp(true)).toBe(false);
    expect(isTimestamp("123abc")).toBe(false);
  });

  it("should handle edge cases in the try-catch block", () => {
    // This tests the catch block in isTimestamp by creating a scenario
    // where safeParse might throw an unexpected error

    // Create a proxy that throws when accessing certain properties
    const throwingProxy = new Proxy(
      {},
      {
        get() {
          throw new Error("Unexpected error during parsing");
        },
      }
    );

    expect(isTimestamp(throwingProxy)).toBe(false);
  });

  it("should work as a type guard", () => {
    const value: unknown = "2023-04-01T12:00:00Z";
    if (isTimestamp(value)) {
      // TypeScript should recognize this will parse to a Date
      const date = getTimestamp(value);
      expect(date).toBeInstanceOf(Date);
    }
  });
});

describe("getTimestamp", () => {
  it("should return valid Date objects", () => {
    const date1 = getTimestamp(new Date("2023-04-01"));
    expect(date1).toBeInstanceOf(Date);
    expect(date1.getFullYear()).toBe(2023);

    const date2 = getTimestamp("2023-04-01T12:00:00Z");
    expect(date2).toBeInstanceOf(Date);

    const date3 = getTimestamp(1_680_350_400_000);
    expect(date3).toBeInstanceOf(Date);

    const date4 = getTimestamp("1680350400");
    expect(date4).toBeInstanceOf(Date);
  });

  it("should throw for invalid timestamps", () => {
    expect(() => getTimestamp("not-a-date")).toThrow("Invalid date string format");
    expect(() => getTimestamp("2023-13-01")).toThrow("Invalid date string format");
    expect(() => getTimestamp(-1)).toThrow("Timestamp cannot be negative");
    expect(() => getTimestamp(null)).toThrow();
    expect(() => getTimestamp(undefined)).toThrow();
    expect(() => getTimestamp({})).toThrow();
    expect(() => getTimestamp([])).toThrow();
  });

  it("should throw for timestamps out of valid range", () => {
    const afterYear9999 = new Date(253_402_300_800_000);
    expect(() => getTimestamp(afterYear9999)).toThrow("Timestamp is out of valid range");
  });

  it("should be useful in functions requiring Date type", () => {
    const calculateAge = (birthdate: unknown) => {
      const birth = getTimestamp(birthdate);
      const now = new Date();
      return Math.floor((now.getTime() - birth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    };

    const birthdate = "1990-01-01";
    const age = calculateAge(birthdate);
    expect(age).toBeGreaterThan(30);
  });
});

describe("timestampSerializer", () => {
  it("should have the correct type identifier", () => {
    expect(timestampSerializer.type).toBe(35);
  });

  it("should correctly identify Date objects", () => {
    expect(timestampSerializer.condition(new Date())).toBe(true);
    expect(timestampSerializer.condition("2023-04-01")).toBe(false);
    expect(timestampSerializer.condition(1_680_350_400_000)).toBe(false);
    expect(timestampSerializer.condition(null)).toBe(false);
    expect(timestampSerializer.condition({})).toBe(false);
  });

  it("should serialize Date to ISO string", () => {
    const date = new Date("2023-04-01T12:00:00Z");
    const serialized = timestampSerializer.serialize(date);
    expect(serialized).toBe("2023-04-01T12:00:00.000Z");
    expect(typeof serialized).toBe("string");
  });

  it("should deserialize ISO string to Date", () => {
    const isoString = "2023-04-01T12:00:00.000Z";
    const deserialized = timestampSerializer.deserialize(isoString);
    expect(deserialized).toBeInstanceOf(Date);
    expect((deserialized as Date).toISOString()).toBe(isoString);
  });

  it("should handle round-trip serialization", () => {
    const originalDate = new Date("2023-04-01T12:00:00Z");
    const serialized = timestampSerializer.serialize(originalDate);
    const deserialized = timestampSerializer.deserialize(serialized);
    expect((deserialized as Date).getTime()).toBe(originalDate.getTime());
    expect((deserialized as Date).toISOString()).toBe(originalDate.toISOString());
  });

  it("should preserve timezone information in UTC", () => {
    const date = new Date("2023-04-01T12:00:00+05:00"); // Date with timezone offset
    const serialized = timestampSerializer.serialize(date);
    expect(serialized).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect((serialized as string).endsWith("Z")).toBe(true); // Should be in UTC
  });
});
