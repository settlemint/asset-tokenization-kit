/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import type { Row } from "@tanstack/react-table";
import { dateFilterFn, __dateFilterFn } from "./date-filter";
import type { FilterValue } from "../types/filter-types";
// Define test data type
interface TestData {
  id: string;
  name: string;
}

// Mock date-fns functions
vi.mock("date-fns", () => ({
  endOfDay: vi.fn(
    (date) =>
      new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        23,
        59,
        59,
        999
      )
  ),
  isAfter: vi.fn((date, compareDate) => date.getTime() > compareDate.getTime()),
  isBefore: vi.fn(
    (date, compareDate) => date.getTime() < compareDate.getTime()
  ),
  isSameDay: vi.fn((date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }),
  isWithinInterval: vi.fn((date, interval) => {
    return (
      date.getTime() >= interval.start.getTime() &&
      date.getTime() <= interval.end.getTime()
    );
  }),
  startOfDay: vi.fn(
    (date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0)
  ),
}));

// Mock the date operators
vi.mock("../operators/date-operators", () => ({
  dateFilterDetails: {
    is: { target: "single" },
    "is not": { target: "single" },
    "is before": { target: "single" },
    "is on or after": { target: "single" },
    "is after": { target: "single" },
    "is on or before": { target: "single" },
    "is between": { target: "plural" },
    "is not between": { target: "plural" },
  },
}));

describe("date-filter", () => {
  const testDate = new Date("2023-06-15T10:30:00Z");
  const filterDate = new Date("2023-06-15T00:00:00Z");
  const otherDate = new Date("2023-06-16T00:00:00Z");

  describe("__dateFilterFn", () => {
    it("should return true when no filter values", () => {
      const filterValue: FilterValue<"date", TestData> = {
        operator: "is",
        values: [],
        columnMeta: undefined,
      };

      expect(__dateFilterFn(testDate, filterValue)).toBe(true);
    });

    it("should return false when first filter value is falsy", () => {
      const filterValue: FilterValue<"date", TestData> = {
        operator: "is",
        values: [null as unknown as Date],
        columnMeta: undefined,
      };

      expect(__dateFilterFn(testDate, filterValue)).toBe(false);
    });

    it("should throw error for singular operators with multiple values", () => {
      const filterValue: FilterValue<"date", TestData> = {
        operator: "is",
        values: [filterDate, otherDate],
        columnMeta: undefined,
      };

      expect(() => __dateFilterFn(testDate, filterValue)).toThrow(
        "Singular operators require at most one filter value"
      );
    });

    it("should throw error for plural operators without exactly two values", () => {
      const filterValue: FilterValue<"date", TestData> = {
        operator: "is between",
        values: [filterDate],
        columnMeta: undefined,
      };

      expect(() => __dateFilterFn(testDate, filterValue)).toThrow(
        "Plural operators require two filter values"
      );
    });

    describe("is operator", () => {
      it("should return true when dates are the same day", () => {
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(true);
      });

      it("should return false when dates are different days", () => {
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is",
          values: [otherDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(false);
      });
    });

    describe("is not operator", () => {
      it("should return false when dates are the same day", () => {
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is not",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(false);
      });

      it("should return true when dates are different days", () => {
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is not",
          values: [otherDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(true);
      });
    });

    describe("is before operator", () => {
      it("should return true when date is before filter date", () => {
        const beforeDate = new Date("2023-06-14T10:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is before",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(beforeDate, filterValue)).toBe(true);
      });

      it("should return false when date is after filter date", () => {
        const afterDate = new Date("2023-06-16T10:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is before",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(afterDate, filterValue)).toBe(false);
      });
    });

    describe("is on or after operator", () => {
      it("should return true when date is same day as filter date", () => {
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is on or after",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(true);
      });

      it("should return true when date is after filter date", () => {
        const afterDate = new Date("2023-06-16T10:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is on or after",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(afterDate, filterValue)).toBe(true);
      });

      it("should return false when date is before filter date", () => {
        const beforeDate = new Date("2023-06-14T10:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is on or after",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(beforeDate, filterValue)).toBe(false);
      });
    });

    describe("is after operator", () => {
      it("should return true when date is after filter date", () => {
        const afterDate = new Date("2023-06-16T10:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is after",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(afterDate, filterValue)).toBe(true);
      });

      it("should return false when date is same day as filter date", () => {
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is after",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(false);
      });

      it("should return false when date is before filter date", () => {
        const beforeDate = new Date("2023-06-14T10:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is after",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(beforeDate, filterValue)).toBe(false);
      });
    });

    describe("is on or before operator", () => {
      it("should return true when date is same day as filter date", () => {
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is on or before",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(true);
      });

      it("should return true when date is before filter date", () => {
        const beforeDate = new Date("2023-06-14T10:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is on or before",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(beforeDate, filterValue)).toBe(true);
      });

      it("should return false when date is after filter date", () => {
        const afterDate = new Date("2023-06-16T10:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is on or before",
          values: [filterDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(afterDate, filterValue)).toBe(false);
      });
    });

    describe("is between operator", () => {
      it("should return true when date is within interval", () => {
        const startDate = new Date("2023-06-10T00:00:00Z");
        const endDate = new Date("2023-06-20T00:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is between",
          values: [startDate, endDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(true);
      });

      it("should return false when date is outside interval", () => {
        const startDate = new Date("2023-06-01T00:00:00Z");
        const endDate = new Date("2023-06-10T00:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is between",
          values: [startDate, endDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(false);
      });

      it("should return false when second date is missing", () => {
        const startDate = new Date("2023-06-10T00:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is between",
          values: [startDate, null as unknown as Date],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(false);
      });
    });

    describe("is not between operator", () => {
      it("should return false when date is within interval", () => {
        const startDate = new Date("2023-06-10T00:00:00Z");
        const endDate = new Date("2023-06-20T00:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is not between",
          values: [startDate, endDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(false);
      });

      it("should return true when date is outside interval", () => {
        const startDate = new Date("2023-06-01T00:00:00Z");
        const endDate = new Date("2023-06-10T00:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is not between",
          values: [startDate, endDate],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(true);
      });

      it("should return false when second date is missing", () => {
        const startDate = new Date("2023-06-10T00:00:00Z");
        const filterValue: FilterValue<"date", TestData> = {
          operator: "is not between",
          values: [startDate, null as unknown as Date],
          columnMeta: undefined,
        };

        expect(__dateFilterFn(testDate, filterValue)).toBe(false);
      });
    });
  });

  describe("dateFilterFn", () => {
    it("should extract date value from row and apply date filter", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(testDate),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"date", TestData> = {
        operator: "is",
        values: [filterDate],
        columnMeta: undefined,
      };

      const result = dateFilterFn(mockRow, "testColumn", filterValue);

      expect(mockRow.getValue).toHaveBeenCalledWith("testColumn");
      expect(result).toBe(true);
    });

    it("should work with different operators", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(testDate),
      } as unknown as Row<TestData>;

      const afterDate = new Date("2023-06-10T00:00:00Z");
      const filterValue: FilterValue<"date", TestData> = {
        operator: "is after",
        values: [afterDate],
        columnMeta: undefined,
      };

      const result = dateFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(true);
    });

    it("should work with between operators", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(testDate),
      } as unknown as Row<TestData>;

      const startDate = new Date("2023-06-10T00:00:00Z");
      const endDate = new Date("2023-06-20T00:00:00Z");
      const filterValue: FilterValue<"date", TestData> = {
        operator: "is between",
        values: [startDate, endDate],
        columnMeta: undefined,
      };

      const result = dateFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(true);
    });

    it("should handle null date from row", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(null),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"date", TestData> = {
        operator: "is",
        values: [filterDate],
        columnMeta: undefined,
      };

      // This will pass null to __dateFilterFn as inputData
      // The function should handle this appropriately
      const result = dateFilterFn(mockRow, "testColumn", filterValue);

      expect(mockRow.getValue).toHaveBeenCalledWith("testColumn");
      expect(result).toBe(false); // Null dates should return false
    });
  });
});
