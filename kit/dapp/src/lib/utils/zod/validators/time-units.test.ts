import { describe, expect, it } from "bun:test";
import {
  getTimeUnit,
  isTimeUnit,
  timeUnit,
  timeUnits,
  type TimeUnit,
} from "./time-units";

describe("timeUnit", () => {
  const validator = timeUnit();

  describe("valid time units", () => {
    it.each(timeUnits.map((unit) => [unit]))("should accept '%s'", (unit) => {
      expect(validator.parse(unit) as string).toBe(unit);
    });

    it("should accept all standard time units", () => {
      expect(validator.parse("seconds") as string).toBe("seconds");
      expect(validator.parse("minutes") as string).toBe("minutes");
      expect(validator.parse("hours") as string).toBe("hours");
      expect(validator.parse("days") as string).toBe("days");
      expect(validator.parse("weeks") as string).toBe("weeks");
      expect(validator.parse("months") as string).toBe("months");
      expect(validator.parse("years") as string).toBe("years");
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

    it("should narrow types correctly", () => {
      const value: unknown = "hours";
      if (isTimeUnit(value)) {
        // Type should be narrowed to TimeUnit
        const unit: TimeUnit = value;
        expect(unit as string).toBe("hours");
      }
    });
  });

  describe("getTimeUnit", () => {
    it("should return valid time units", () => {
      expect(getTimeUnit("seconds") as string).toBe("seconds");
      expect(getTimeUnit("minutes") as string).toBe("minutes");
      expect(getTimeUnit("hours") as string).toBe("hours");
      expect(getTimeUnit("days") as string).toBe("days");
      expect(getTimeUnit("weeks") as string).toBe("weeks");
      expect(getTimeUnit("months") as string).toBe("months");
      expect(getTimeUnit("years") as string).toBe("years");
    });

    it("should throw for invalid time units", () => {
      expect(() => getTimeUnit("second")).toThrow();
      expect(() => getTimeUnit("milliseconds")).toThrow();
      expect(() => getTimeUnit("")).toThrow();
      expect(() => getTimeUnit(60)).toThrow("Expected 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years', received number");
      expect(() => getTimeUnit(null)).toThrow("Expected 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years', received null");
      expect(() => getTimeUnit(undefined)).toThrow("Required");
      expect(() => getTimeUnit({})).toThrow("Expected 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years', received object");
      expect(() => getTimeUnit("Seconds")).toThrow();
      expect(() => getTimeUnit("sec")).toThrow();
    });
  });
});

describe("helper functions", () => {
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
      expect(isTimeUnit("second")).toBe(false); // singular
      expect(isTimeUnit("minute")).toBe(false);
      expect(isTimeUnit("milliseconds")).toBe(false); // not in list
      expect(isTimeUnit("decades")).toBe(false);
      expect(isTimeUnit("")).toBe(false);
      expect(isTimeUnit(60)).toBe(false); // number
      expect(isTimeUnit(null)).toBe(false);
      expect(isTimeUnit(undefined)).toBe(false);
      expect(isTimeUnit({})).toBe(false);
      expect(isTimeUnit("Seconds")).toBe(false); // wrong case
      expect(isTimeUnit("MINUTES")).toBe(false);
      expect(isTimeUnit("sec")).toBe(false); // abbreviation
      expect(isTimeUnit("min")).toBe(false);
    });

    it("should narrow types correctly", () => {
      const value: unknown = "hours";
      if (isTimeUnit(value)) {
        // Type should be narrowed to TimeUnit
        const unit: TimeUnit = value;
        expect(unit as string).toBe("hours");
      }
    });
  });

  describe("getTimeUnit", () => {
    it("should return valid time units", () => {
      expect(getTimeUnit("seconds") as string).toBe("seconds");
      expect(getTimeUnit("minutes") as string).toBe("minutes");
      expect(getTimeUnit("hours") as string).toBe("hours");
      expect(getTimeUnit("days") as string).toBe("days");
      expect(getTimeUnit("weeks") as string).toBe("weeks");
      expect(getTimeUnit("months") as string).toBe("months");
      expect(getTimeUnit("years") as string).toBe("years");
    });

    it("should throw for invalid time units", () => {
      expect(() => getTimeUnit("second")).toThrow();
      expect(() => getTimeUnit("milliseconds")).toThrow();
      expect(() => getTimeUnit("")).toThrow();
      expect(() => getTimeUnit(60)).toThrow("Expected 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years', received number");
      expect(() => getTimeUnit(null)).toThrow("Expected 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years', received null");
      expect(() => getTimeUnit(undefined)).toThrow("Required");
      expect(() => getTimeUnit({})).toThrow("Expected 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years', received object");
      expect(() => getTimeUnit("Seconds")).toThrow();
      expect(() => getTimeUnit("sec")).toThrow();
    });
  });
});
