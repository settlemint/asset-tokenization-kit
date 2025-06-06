import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import {
  futureTimestamp,
  getFutureTimestamp,
  getPastTimestamp,
  getTimestamp,
  getTimestampInRange,
  getTimestampWithMaxAge,
  isFutureTimestamp,
  isPastTimestamp,
  isTimestamp,
  isTimestampInRange,
  isTimestampWithMaxAge,
  pastTimestamp,
  timestamp,
  timestampInRange,
  timestampWithMaxAge,
  type Timestamp,
} from "./timestamp";

describe("timestamp", () => {
  const validator = timestamp();

  // Fixed dates for testing
  const testDate = new Date("2023-04-01T12:00:00Z");
  const testDateMs = 1680350400000; // Actual milliseconds for 2023-04-01T12:00:00Z
  const testDateSec = 1680350400; // Seconds

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
        "Invalid date string"
      );
      expect(() => validator.parse("2023-13-01")).toThrow(
        "Invalid date string"
      );
      expect(() => validator.parse("2023-04-32")).toThrow(
        "Invalid date string"
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
      const year2286 = 9999999999999; // Just under the microsecond threshold
      const result = validator.parse(year2286);
      expect(result.getFullYear()).toBe(2286);
    });

    it("should handle microsecond timestamps", () => {
      // This will be treated as microseconds and result in an earlier date
      const microsecondTimestamp = 1680350400000000; // Microseconds for our test date
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
      expect(result1.getTime()).toBe(168035400 * 1000);

      // 11 digits - ambiguous, treat as milliseconds
      const result2 = validator.parse("16803540000");
      expect(result2.getTime()).toBe(16803540000);
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
      expect(() => validator.parse("123abc")).toThrow("Invalid date string");
      expect(() => validator.parse("2023-04-01T12:00:00Z123")).toThrow();
    });
  });
});

describe("futureTimestamp", () => {
  const validator = futureTimestamp();

  // Mock current time for consistent testing
  let originalDateNow: typeof Date.now;
  const mockNow = new Date("2023-04-01T12:00:00Z").getTime();

  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = () => mockNow;
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it("should accept future dates", () => {
    const futureDate = new Date("2025-01-01");
    const result = validator.parse(futureDate);
    expect(result as Date).toEqual(futureDate);
  });

  it("should reject past dates", () => {
    const pastDate = new Date("2020-01-01");
    expect(() => validator.parse(pastDate)).toThrow(
      "Timestamp must be in the future"
    );
  });

  it("should reject current time", () => {
    expect(() => validator.parse(mockNow)).toThrow(
      "Timestamp must be in the future"
    );
  });
});

describe("pastTimestamp", () => {
  const validator = pastTimestamp();

  let originalDateNow: typeof Date.now;
  const mockNow = new Date("2023-04-01T12:00:00Z").getTime();

  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = () => mockNow;
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it("should accept past dates", () => {
    const pastDate = new Date("2020-01-01");
    const result = validator.parse(pastDate);
    expect(result as Date).toEqual(pastDate);
  });

  it("should reject future dates", () => {
    const futureDate = new Date("2025-01-01");
    expect(() => validator.parse(futureDate)).toThrow(
      "Timestamp must be in the past"
    );
  });
});

describe("timestampInRange", () => {
  const min = new Date("2023-01-01");
  const max = new Date("2023-12-31");
  const validator = timestampInRange(min, max);

  it("should accept dates within range", () => {
    const midDate = new Date("2023-06-15");
    expect(validator.parse(midDate) as Date).toEqual(midDate);
    expect(validator.parse(min) as Date).toEqual(min);
    expect(validator.parse(max) as Date).toEqual(max);
  });

  it("should reject dates outside range", () => {
    const beforeMin = new Date("2022-12-31");
    const afterMax = new Date("2024-01-01");

    expect(() => validator.parse(beforeMin)).toThrow(
      `Timestamp must be between ${min.toISOString()} and ${max.toISOString()}`
    );
    expect(() => validator.parse(afterMax)).toThrow(
      `Timestamp must be between ${min.toISOString()} and ${max.toISOString()}`
    );
  });
});

describe("timestampWithMaxAge", () => {
  let originalDateNow: typeof Date.now;
  const mockNow = new Date("2023-04-01T12:00:00Z").getTime();

  beforeEach(() => {
    originalDateNow = Date.now;
    Date.now = () => mockNow;
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  it("should accept recent timestamps", () => {
    const oneHourAgo = new Date(mockNow - 60 * 60 * 1000);
    const validator = timestampWithMaxAge(2 * 60 * 60 * 1000); // 2 hours

    expect(validator.parse(oneHourAgo) as Date).toEqual(oneHourAgo);
  });

  it("should reject old timestamps", () => {
    const threeDaysAgo = new Date(mockNow - 3 * 24 * 60 * 60 * 1000);
    const validator = timestampWithMaxAge(24 * 60 * 60 * 1000); // 1 day

    expect(() => validator.parse(threeDaysAgo)).toThrow(
      "Timestamp must be within the last 86400000ms"
    );
  });
});

describe("helper functions", () => {
  // Fixed dates for testing
  const testDate = new Date("2023-04-01T12:00:00Z");
  const testDateMs = 1680350400000;
  const testDateSec = 1680350400;

  describe("isTimestamp", () => {
    it("should return true for valid timestamps", () => {
      expect(isTimestamp(testDate)).toBe(true);
      expect(isTimestamp("2023-04-01T12:00:00Z")).toBe(true);
      expect(isTimestamp(testDateMs)).toBe(true);
      expect(isTimestamp(testDateSec)).toBe(true);
      expect(isTimestamp("1680350400")).toBe(true);
      expect(isTimestamp("1680350400000")).toBe(true);
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
    });

    it("should narrow types correctly", () => {
      const value: unknown = testDate;
      if (isTimestamp(value)) {
        // Type should be narrowed to Timestamp
        const ts: Timestamp = value;
        expect(ts as Date).toEqual(testDate);
      }
    });
  });

  describe("getTimestamp", () => {
    it("should return valid timestamps", () => {
      expect(getTimestamp(testDate) as Date).toEqual(testDate);
      expect(getTimestamp("2023-04-01T12:00:00Z").getTime()).toBe(testDateMs);
      expect(getTimestamp(testDateMs).getTime()).toBe(testDateMs);
      expect(getTimestamp(testDateSec).getTime()).toBe(testDateMs);
    });

    it("should throw for invalid timestamps", () => {
      expect(() => getTimestamp("not-a-date")).toThrow();
      expect(() => getTimestamp(-1)).toThrow();
      expect(() => getTimestamp(null)).toThrow();
      expect(() => getTimestamp(undefined)).toThrow();
      expect(() => getTimestamp({})).toThrow();
    });
  });

  describe("isFutureTimestamp / getFutureTimestamp", () => {
    let originalDateNow: typeof Date.now;
    const mockNow = new Date("2023-04-01T12:00:00Z").getTime();

    beforeEach(() => {
      originalDateNow = Date.now;
      Date.now = () => mockNow;
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    it("should validate future timestamps", () => {
      const futureDate = new Date("2025-01-01");
      expect(isFutureTimestamp(futureDate)).toBe(true);
      expect(getFutureTimestamp(futureDate) as Date).toEqual(futureDate);
    });

    it("should reject past timestamps", () => {
      const pastDate = new Date("2020-01-01");
      expect(isFutureTimestamp(pastDate)).toBe(false);
      expect(() => getFutureTimestamp(pastDate)).toThrow(
        "Invalid future timestamp"
      );
    });
  });

  describe("isPastTimestamp / getPastTimestamp", () => {
    let originalDateNow: typeof Date.now;
    const mockNow = new Date("2023-04-01T12:00:00Z").getTime();

    beforeEach(() => {
      originalDateNow = Date.now;
      Date.now = () => mockNow;
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    it("should validate past timestamps", () => {
      const pastDate = new Date("2020-01-01");
      expect(isPastTimestamp(pastDate)).toBe(true);
      expect(getPastTimestamp(pastDate) as Date).toEqual(pastDate);
    });

    it("should reject future timestamps", () => {
      const futureDate = new Date("2025-01-01");
      expect(isPastTimestamp(futureDate)).toBe(false);
      expect(() => getPastTimestamp(futureDate)).toThrow(
        "Invalid past timestamp"
      );
    });
  });

  describe("isTimestampInRange / getTimestampInRange", () => {
    const min = new Date("2023-01-01");
    const max = new Date("2023-12-31");

    it("should validate timestamps in range", () => {
      const midDate = new Date("2023-06-15");
      expect(isTimestampInRange(midDate, min, max)).toBe(true);
      expect(getTimestampInRange(midDate, min, max) as Date).toEqual(midDate);
      expect(isTimestampInRange(min, min, max)).toBe(true);
      expect(isTimestampInRange(max, min, max)).toBe(true);
    });

    it("should reject timestamps outside range", () => {
      const beforeMin = new Date("2022-12-31");
      const afterMax = new Date("2024-01-01");
      expect(isTimestampInRange(beforeMin, min, max)).toBe(false);
      expect(isTimestampInRange(afterMax, min, max)).toBe(false);
      expect(() => getTimestampInRange(beforeMin, min, max)).toThrow(
        "Invalid timestamp in range"
      );
    });
  });

  describe("isTimestampWithMaxAge / getTimestampWithMaxAge", () => {
    let originalDateNow: typeof Date.now;
    const mockNow = new Date("2023-04-01T12:00:00Z").getTime();

    beforeEach(() => {
      originalDateNow = Date.now;
      Date.now = () => mockNow;
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    it("should validate timestamps within max age", () => {
      const oneHourAgo = new Date(mockNow - 60 * 60 * 1000);
      const maxAge = 2 * 60 * 60 * 1000; // 2 hours
      expect(isTimestampWithMaxAge(oneHourAgo, maxAge)).toBe(true);
      expect(getTimestampWithMaxAge(oneHourAgo, maxAge) as Date).toEqual(
        oneHourAgo
      );
    });

    it("should reject timestamps beyond max age", () => {
      const threeDaysAgo = new Date(mockNow - 3 * 24 * 60 * 60 * 1000);
      const maxAge = 24 * 60 * 60 * 1000; // 1 day
      expect(isTimestampWithMaxAge(threeDaysAgo, maxAge)).toBe(false);
      expect(() => getTimestampWithMaxAge(threeDaysAgo, maxAge)).toThrow(
        "Invalid timestamp with max age"
      );
    });
  });
});
