import { describe, expect, it } from "vitest";
import { timeUnit, timeUnits, isTimeUnit, getTimeUnit } from "./time-units";

describe("timeUnit", () => {
  const validator = timeUnit();

  describe("valid time units", () => {
    it.each(timeUnits.map((unit) => [unit]))("should accept '%s'", (unit) => {
      expect(validator.parse(unit)).toBe(unit);
    });

    it("should accept all standard time units", () => {
      expect(validator.parse("seconds")).toBe("seconds");
      expect(validator.parse("minutes")).toBe("minutes");
      expect(validator.parse("hours")).toBe("hours");
      expect(validator.parse("days")).toBe("days");
      expect(validator.parse("weeks")).toBe("weeks");
      expect(validator.parse("months")).toBe("months");
      expect(validator.parse("years")).toBe("years");
    });
  });

  describe("invalid time units", () => {
    it("should reject invalid unit names", () => {
      expect(() => validator.parse("second")).toThrow(); // singular
      expect(() => validator.parse("minute")).toThrow(); // singular
      expect(() => validator.parse("milliseconds")).toThrow(); // not in list
      expect(() => validator.parse("decades")).toThrow(); // not in list
      expect(() => validator.parse("")).toThrow();
    });

    it("should reject non-string types", () => {
      expect(() => validator.parse(60)).toThrow();
      expect(() => validator.parse(null)).toThrow();
      expect(() => validator.parse(undefined)).toThrow();
      expect(() => validator.parse({})).toThrow();
    });

    it("should be case-sensitive", () => {
      expect(() => validator.parse("Seconds")).toThrow();
      expect(() => validator.parse("MINUTES")).toThrow();
      expect(() => validator.parse("Hours")).toThrow();
    });

    it("should reject abbreviated forms", () => {
      expect(() => validator.parse("sec")).toThrow();
      expect(() => validator.parse("min")).toThrow();
      expect(() => validator.parse("hr")).toThrow();
      expect(() => validator.parse("d")).toThrow();
      expect(() => validator.parse("w")).toThrow();
      expect(() => validator.parse("m")).toThrow();
      expect(() => validator.parse("y")).toThrow();
    });
  });

  describe("safeParse", () => {
    it("should return success for valid time unit", () => {
      const result = validator.safeParse("hours");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("hours");
      }
    });

    it("should return error for invalid time unit", () => {
      const result = validator.safeParse("invalid");
      expect(result.success).toBe(false);
    });
  });

  describe("type checking", () => {
    it("should return proper type", () => {
      const result = validator.parse("hours");
      // Test that the type is correctly inferred
      expect(result).toBe("hours");
    });

    it("should handle safeParse", () => {
      const result = validator.safeParse("days");
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe("days");
      }
    });
  });
});

describe("isTimeUnit", () => {
  it("should return true for valid time units", () => {
    expect(isTimeUnit("seconds")).toBe(true);
    expect(isTimeUnit("minutes")).toBe(true);
    expect(isTimeUnit("hours")).toBe(true);
    expect(isTimeUnit("days")).toBe(true);
    expect(isTimeUnit("weeks")).toBe(true);
    expect(isTimeUnit("months")).toBe(true);
    expect(isTimeUnit("years")).toBe(true);
  });

  it("should return false for invalid time units", () => {
    expect(isTimeUnit("second")).toBe(false);
    expect(isTimeUnit("minute")).toBe(false);
    expect(isTimeUnit("milliseconds")).toBe(false);
    expect(isTimeUnit("decades")).toBe(false);
    expect(isTimeUnit("")).toBe(false);
    expect(isTimeUnit(null)).toBe(false);
    expect(isTimeUnit(undefined)).toBe(false);
    expect(isTimeUnit(60)).toBe(false);
    expect(isTimeUnit({})).toBe(false);
    expect(isTimeUnit([])).toBe(false);
    expect(isTimeUnit("Seconds")).toBe(false);
    expect(isTimeUnit("MINUTES")).toBe(false);
  });

  it("should work as a type guard", () => {
    const value: unknown = "days";
    if (isTimeUnit(value)) {
      // TypeScript should recognize value as TimeUnit here
      const validUnit:
        | "seconds"
        | "minutes"
        | "hours"
        | "days"
        | "weeks"
        | "months"
        | "years" = value;
      expect(validUnit).toBe("days");
    }
  });
});

describe("getTimeUnit", () => {
  it("should return valid time units", () => {
    expect(getTimeUnit("seconds")).toBe("seconds");
    expect(getTimeUnit("minutes")).toBe("minutes");
    expect(getTimeUnit("hours")).toBe("hours");
    expect(getTimeUnit("days")).toBe("days");
    expect(getTimeUnit("weeks")).toBe("weeks");
    expect(getTimeUnit("months")).toBe("months");
    expect(getTimeUnit("years")).toBe("years");
  });

  it("should throw for invalid time units", () => {
    expect(() => getTimeUnit("second")).toThrow();
    expect(() => getTimeUnit("minute")).toThrow();
    expect(() => getTimeUnit("milliseconds")).toThrow();
    expect(() => getTimeUnit("decades")).toThrow();
    expect(() => getTimeUnit("")).toThrow();
    expect(() => getTimeUnit(null)).toThrow();
    expect(() => getTimeUnit(undefined)).toThrow();
    expect(() => getTimeUnit(60)).toThrow();
    expect(() => getTimeUnit({})).toThrow();
    expect(() => getTimeUnit([])).toThrow();
  });

  it("should throw for case variations", () => {
    expect(() => getTimeUnit("Seconds")).toThrow();
    expect(() => getTimeUnit("MINUTES")).toThrow();
    expect(() => getTimeUnit("Hours")).toThrow();
  });

  it("should be useful in functions requiring TimeUnit type", () => {
    const convertToSeconds = (value: number, unit: string) => {
      const validatedUnit = getTimeUnit(unit);
      const conversions = {
        seconds: 1,
        minutes: 60,
        hours: 3600,
        days: 86_400,
        weeks: 604_800,
        months: 2_592_000, // 30 days
        years: 31_536_000, // 365 days
      };
      return value * conversions[validatedUnit];
    };

    expect(convertToSeconds(2, "minutes")).toBe(120);
    expect(convertToSeconds(1, "hours")).toBe(3600);
    expect(() => convertToSeconds(1, "invalid")).toThrow();
  });
});
