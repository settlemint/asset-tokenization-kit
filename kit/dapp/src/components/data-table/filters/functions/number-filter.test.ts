/**
 * @vitest-environment node
 */
import type { Row } from "@tanstack/react-table";
import { describe, expect, it, vi } from "vitest";
import type { FilterValue, NumberFilterOperator } from "../types/filter-types";
import { __numberFilterFn, numberFilterFn } from "./number-filter";
// Define test data type
interface TestData {
  id: string;
  name: string;
}

describe("number-filter", () => {
  describe("__numberFilterFn", () => {
    it("should return true when no filter values", () => {
      const filterValue: FilterValue<"number", TestData> = {
        operator: "is",
        values: [],
        columnMeta: undefined,
      };

      expect(__numberFilterFn(5, filterValue)).toBe(true);
    });

    it("should return true when filter value is undefined", () => {
      const filterValue: FilterValue<"number", TestData> = {
        operator: "is",
        values: [undefined as unknown as number],
        columnMeta: undefined,
      };

      expect(__numberFilterFn(5, filterValue)).toBe(true);
    });

    describe("is operator", () => {
      it("should return true when values are equal", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(true);
        expect(__numberFilterFn(5, filterValue)).toBe(true);
      });

      it("should return false when values are not equal", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(4, filterValue)).toBe(false);
        expect(__numberFilterFn(6, filterValue)).toBe(false);
        expect(__numberFilterFn(5.1, filterValue)).toBe(false);
      });

      it("should handle zero values", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is",
          values: [0],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(0, filterValue)).toBe(true);
        expect(__numberFilterFn(-0, filterValue)).toBe(true);
        expect(__numberFilterFn(0, filterValue)).toBe(true);
      });

      it("should handle negative numbers", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is",
          values: [-5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(-5, filterValue)).toBe(true);
        expect(__numberFilterFn(5, filterValue)).toBe(false);
      });

      it("should handle floating point numbers", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is",
          values: [3.14],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(3.14, filterValue)).toBe(true);
        // oxlint-disable-next-line approx-constant
        expect(__numberFilterFn(3.141, filterValue)).toBe(false);
      });
    });

    describe("is not operator", () => {
      it("should return false when values are equal", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is not",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(false);
      });

      it("should return true when values are not equal", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is not",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(4, filterValue)).toBe(true);
        expect(__numberFilterFn(6, filterValue)).toBe(true);
        expect(__numberFilterFn(-5, filterValue)).toBe(true);
      });
    });

    describe("is greater than operator", () => {
      it("should return true when value is greater", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is greater than",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(6, filterValue)).toBe(true);
        expect(__numberFilterFn(5.1, filterValue)).toBe(true);
        expect(__numberFilterFn(100, filterValue)).toBe(true);
      });

      it("should return false when value is less than or equal", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is greater than",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(false);
        expect(__numberFilterFn(4, filterValue)).toBe(false);
        expect(__numberFilterFn(0, filterValue)).toBe(false);
        expect(__numberFilterFn(-1, filterValue)).toBe(false);
      });
    });

    describe("is greater than or equal to operator", () => {
      it("should return true when value is greater than or equal", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is greater than or equal to",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(true);
        expect(__numberFilterFn(6, filterValue)).toBe(true);
        expect(__numberFilterFn(5.1, filterValue)).toBe(true);
      });

      it("should return false when value is less than", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is greater than or equal to",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(4, filterValue)).toBe(false);
        expect(__numberFilterFn(4.9, filterValue)).toBe(false);
        expect(__numberFilterFn(-1, filterValue)).toBe(false);
      });
    });

    describe("is less than operator", () => {
      it("should return true when value is less", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is less than",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(4, filterValue)).toBe(true);
        expect(__numberFilterFn(4.9, filterValue)).toBe(true);
        expect(__numberFilterFn(0, filterValue)).toBe(true);
        expect(__numberFilterFn(-1, filterValue)).toBe(true);
      });

      it("should return false when value is greater than or equal", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is less than",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(false);
        expect(__numberFilterFn(6, filterValue)).toBe(false);
        expect(__numberFilterFn(5.1, filterValue)).toBe(false);
      });
    });

    describe("is less than or equal to operator", () => {
      it("should return true when value is less than or equal", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is less than or equal to",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(true);
        expect(__numberFilterFn(4, filterValue)).toBe(true);
        expect(__numberFilterFn(4.9, filterValue)).toBe(true);
        expect(__numberFilterFn(0, filterValue)).toBe(true);
      });

      it("should return false when value is greater than", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is less than or equal to",
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(6, filterValue)).toBe(false);
        expect(__numberFilterFn(5.1, filterValue)).toBe(false);
        expect(__numberFilterFn(100, filterValue)).toBe(false);
      });
    });

    describe("is between operator", () => {
      it("should return true when value is within range (inclusive)", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is between",
          values: [5, 10],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(true);
        expect(__numberFilterFn(7, filterValue)).toBe(true);
        expect(__numberFilterFn(10, filterValue)).toBe(true);
        expect(__numberFilterFn(7.5, filterValue)).toBe(true);
      });

      it("should return false when value is outside range", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is between",
          values: [5, 10],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(4, filterValue)).toBe(false);
        expect(__numberFilterFn(11, filterValue)).toBe(false);
        expect(__numberFilterFn(4.9, filterValue)).toBe(false);
        expect(__numberFilterFn(10.1, filterValue)).toBe(false);
      });

      it("should return true when bounds are undefined", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is between",
          values: [undefined as unknown as number, 10],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(true);

        const filterValue2: FilterValue<"number", TestData> = {
          operator: "is between",
          values: [5, undefined as unknown as number],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue2)).toBe(true);
      });

      it("should handle negative ranges", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is between",
          values: [-10, -5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(-7, filterValue)).toBe(true);
        expect(__numberFilterFn(-5, filterValue)).toBe(true);
        expect(__numberFilterFn(-10, filterValue)).toBe(true);
        expect(__numberFilterFn(-4, filterValue)).toBe(false);
        expect(__numberFilterFn(-11, filterValue)).toBe(false);
      });
    });

    describe("is not between operator", () => {
      it("should return false when value is within range", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is not between",
          values: [5, 10],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(false);
        expect(__numberFilterFn(7, filterValue)).toBe(false);
        expect(__numberFilterFn(10, filterValue)).toBe(false);
        expect(__numberFilterFn(7.5, filterValue)).toBe(false);
      });

      it("should return true when value is outside range", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is not between",
          values: [5, 10],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(4, filterValue)).toBe(true);
        expect(__numberFilterFn(11, filterValue)).toBe(true);
        expect(__numberFilterFn(4.9, filterValue)).toBe(true);
        expect(__numberFilterFn(10.1, filterValue)).toBe(true);
      });

      it("should return true when bounds are undefined", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "is not between",
          values: [undefined as unknown as number, 10],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue)).toBe(true);

        const filterValue2: FilterValue<"number", TestData> = {
          operator: "is not between",
          values: [5, undefined as unknown as number],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(5, filterValue2)).toBe(true);
      });
    });

    describe("unknown operator", () => {
      it("should return true for unknown operators", () => {
        const filterValue: FilterValue<"number", TestData> = {
          operator: "unknown" as unknown as NumberFilterOperator,
          values: [5],
          columnMeta: undefined,
        };

        expect(__numberFilterFn(3, filterValue)).toBe(true);
        expect(__numberFilterFn(5, filterValue)).toBe(true);
        expect(__numberFilterFn(7, filterValue)).toBe(true);
      });
    });

    it("should only use first value for single-value operators", () => {
      const filterValue: FilterValue<"number", TestData> = {
        operator: "is",
        values: [5, 10, 15], // Extra values should be ignored
        columnMeta: undefined,
      };

      expect(__numberFilterFn(5, filterValue)).toBe(true);
      expect(__numberFilterFn(10, filterValue)).toBe(false);
    });
  });

  describe("numberFilterFn", () => {
    it("should extract value from row and apply number filter", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(5),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"number", TestData> = {
        operator: "is",
        values: [5],
        columnMeta: undefined,
      };

      const result = numberFilterFn(mockRow, "testColumn", filterValue);

      expect(mockRow.getValue).toHaveBeenCalledWith("testColumn");
      expect(result).toBe(true);
    });

    it("should handle various number types from row", () => {
      const testCases = [
        { value: 0, expected: false }, // 0 !== 5
        { value: -5, expected: false },
        { value: 5.5, expected: false },
        { value: 5, expected: true },
      ];

      testCases.forEach(({ value, expected }) => {
        const mockRow = {
          getValue: vi.fn().mockReturnValue(value),
        } as unknown as Row<TestData>;

        const filterValue: FilterValue<"number", TestData> = {
          operator: "is",
          values: [5],
          columnMeta: undefined,
        };

        const result = numberFilterFn(mockRow, "testColumn", filterValue);
        expect(result).toBe(expected);
      });
    });

    it("should work with different operators", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(7),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"number", TestData> = {
        operator: "is greater than",
        values: [5],
        columnMeta: undefined,
      };

      const result = numberFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(true);
    });

    it("should work with between operators", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(7),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"number", TestData> = {
        operator: "is between",
        values: [5, 10],
        columnMeta: undefined,
      };

      const result = numberFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(true);
    });
  });
});
