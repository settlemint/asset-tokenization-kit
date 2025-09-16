import { describe, expect, it } from "bun:test";
import {
  getResidencyStatus,
  getResidencyStatusArray,
  isResidencyStatus,
  isResidencyStatusArray,
  residencyStatus,
  residencyStatusArray,
  ResidencyStatusEnum,
  residencyStatuses,
  residencyStatusWithDefault,
} from "./residency-status";

describe("ResidencyStatus Validation", () => {
  describe("residencyStatuses constant", () => {
    it("should contain all expected residency status values", () => {
      expect(residencyStatuses).toEqual([
        "resident",
        "non_resident",
        "dual_resident",
        "unknown",
      ]);
    });
  });

  describe("ResidencyStatusEnum", () => {
    it("should have correct values", () => {
      expect(ResidencyStatusEnum.resident).toBe("resident");
      expect(ResidencyStatusEnum.non_resident).toBe("non_resident");
      expect(ResidencyStatusEnum.dual_resident).toBe("dual_resident");
      expect(ResidencyStatusEnum.unknown).toBe("unknown");
    });
  });

  describe("residencyStatus schema", () => {
    it("should validate correct residency status values", () => {
      const schema = residencyStatus();
      expect(schema.parse("resident")).toBe("resident");
      expect(schema.parse("non_resident")).toBe("non_resident");
      expect(schema.parse("dual_resident")).toBe("dual_resident");
      expect(schema.parse("unknown")).toBe("unknown");
    });

    it("should reject invalid residency status values", () => {
      const schema = residencyStatus();
      expect(() => schema.parse("invalid")).toThrow();
      expect(() => schema.parse("permanent_resident")).toThrow();
      expect(() => schema.parse("")).toThrow();
      expect(() => schema.parse(123)).toThrow();
    });

    it("should be case-sensitive", () => {
      const schema = residencyStatus();
      expect(() => schema.parse("RESIDENT")).toThrow();
      expect(() => schema.parse("Non_Resident")).toThrow();
    });
  });

  describe("residencyStatusArray schema", () => {
    it("should validate arrays of residency statuses", () => {
      const schema = residencyStatusArray();
      expect(schema.parse(["resident"])).toEqual(["resident"]);
      expect(schema.parse(["resident", "non_resident"])).toEqual([
        "resident",
        "non_resident",
      ]);
      expect(schema.parse(residencyStatuses)).toEqual([...residencyStatuses]);
    });

    it("should reject empty arrays", () => {
      const schema = residencyStatusArray();
      expect(() => schema.parse([])).toThrow(
        "At least one residency status must be selected"
      );
    });

    it("should reject arrays with invalid values", () => {
      const schema = residencyStatusArray();
      expect(() => schema.parse(["resident", "invalid"])).toThrow();
      expect(() => schema.parse(["permanent"])).toThrow();
    });
  });

  describe("residencyStatusWithDefault", () => {
    it("should use default value when undefined", () => {
      const schema = residencyStatusWithDefault("resident");
      expect(schema.parse(undefined)).toBe("resident");
    });

    it("should use provided value when not undefined", () => {
      const schema = residencyStatusWithDefault("resident");
      expect(schema.parse("non_resident")).toBe("non_resident");
    });

    it("should use 'unknown' as default when no default specified", () => {
      const schema = residencyStatusWithDefault();
      expect(schema.parse(undefined)).toBe("unknown");
    });
  });

  describe("isResidencyStatus type guard", () => {
    it("should return true for valid residency statuses", () => {
      expect(isResidencyStatus("resident")).toBe(true);
      expect(isResidencyStatus("non_resident")).toBe(true);
      expect(isResidencyStatus("dual_resident")).toBe(true);
      expect(isResidencyStatus("unknown")).toBe(true);
    });

    it("should return false for invalid values", () => {
      expect(isResidencyStatus("invalid")).toBe(false);
      expect(isResidencyStatus("")).toBe(false);
      expect(isResidencyStatus(123)).toBe(false);
      expect(isResidencyStatus(null)).toBe(false);
      expect(isResidencyStatus(undefined)).toBe(false);
    });
  });

  describe("getResidencyStatus parser", () => {
    it("should return valid residency statuses", () => {
      expect(getResidencyStatus("resident")).toBe("resident");
      expect(getResidencyStatus("non_resident")).toBe("non_resident");
    });

    it("should throw for invalid values", () => {
      expect(() => getResidencyStatus("invalid")).toThrow();
      expect(() => getResidencyStatus(123)).toThrow();
    });
  });

  describe("isResidencyStatusArray type guard", () => {
    it("should return true for valid arrays", () => {
      expect(isResidencyStatusArray(["resident"])).toBe(true);
      expect(isResidencyStatusArray(["resident", "non_resident"])).toBe(true);
      expect(isResidencyStatusArray(residencyStatuses)).toBe(true);
    });

    it("should return false for invalid arrays", () => {
      expect(isResidencyStatusArray([])).toBe(false);
      expect(isResidencyStatusArray(["invalid"])).toBe(false);
      expect(isResidencyStatusArray(["resident", "invalid"])).toBe(false);
      expect(isResidencyStatusArray("resident")).toBe(false);
      expect(isResidencyStatusArray(123)).toBe(false);
    });
  });

  describe("getResidencyStatusArray parser", () => {
    it("should return valid arrays", () => {
      expect(getResidencyStatusArray(["resident"])).toEqual(["resident"]);
      expect(getResidencyStatusArray(["resident", "non_resident"])).toEqual([
        "resident",
        "non_resident",
      ]);
    });

    it("should throw for invalid arrays", () => {
      expect(() => getResidencyStatusArray([])).toThrow();
      expect(() => getResidencyStatusArray(["invalid"])).toThrow();
      expect(() => getResidencyStatusArray("resident")).toThrow();
    });
  });
});
