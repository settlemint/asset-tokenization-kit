/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Row } from "@tanstack/react-table";
import {
  multiOptionFilterFn,
  __multiOptionFilterFn,
} from "./multi-option-filter";
import type { FilterValue } from "../types/filter-types";
import type { ColumnOption } from "../types/column-types";
// Define test data type
interface TestData {
  id: string;
  name: string;
}

// Mock the array utility functions
vi.mock("../../data-table-array", () => ({
  intersection: vi.fn((arr1, arr2) =>
    arr1.filter((item: unknown) => arr2.includes(item))
  ),
  uniq: vi.fn((arr) => [...new Set(arr)]),
}));

// Mock the type guards
vi.mock("../utils/type-guards", () => ({
  isStringArray: vi.fn(
    (value) => Array.isArray(value) && typeof value[0] === "string"
  ),
  isColumnOptionArray: vi.fn(
    (value) =>
      Array.isArray(value) &&
      typeof value[0] === "object" &&
      "value" in value[0]
  ),
}));

import { intersection as _intersection, uniq } from "../../data-table-array";
import { isStringArray, isColumnOptionArray } from "../utils/type-guards";

describe("multi-option-filter", () => {
  describe("__multiOptionFilterFn", () => {
    it("should return false when input data is empty", () => {
      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["tag1", "tag2"]],
        columnMeta: { type: "multiOption" },
      };

      expect(__multiOptionFilterFn([], filterValue)).toBe(false);
    });

    it("should return true when no filter values", () => {
      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [],
        columnMeta: { type: "multiOption" },
      };

      expect(__multiOptionFilterFn(["tag1"], filterValue)).toBe(true);
    });

    it("should return true when filter values array is empty", () => {
      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [[]],
        columnMeta: { type: "multiOption" },
      };

      expect(__multiOptionFilterFn(["tag1"], filterValue)).toBe(true);
    });

    it("should return true when first filter value is falsy", () => {
      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [null as unknown as string[]],
        columnMeta: { type: "multiOption" },
      };

      expect(__multiOptionFilterFn(["tag1"], filterValue)).toBe(true);
    });

    describe("include / include any of operator", () => {
      it("should return true when input includes any filter value", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "include",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(__multiOptionFilterFn(["tag1", "tag3"], filterValue)).toBe(true);
        expect(__multiOptionFilterFn(["tag2"], filterValue)).toBe(true);
        expect(__multiOptionFilterFn(["tag1", "tag2"], filterValue)).toBe(true);
      });

      it("should return false when input includes no filter values", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "include",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(__multiOptionFilterFn(["tag3", "tag4"], filterValue)).toBe(
          false
        );
      });

      it("should work with include any of operator", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "include any of",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(__multiOptionFilterFn(["tag1", "tag3"], filterValue)).toBe(true);
        expect(__multiOptionFilterFn(["tag3", "tag4"], filterValue)).toBe(
          false
        );
      });
    });

    describe("exclude operator", () => {
      it("should return true when input excludes all filter values", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "exclude",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(__multiOptionFilterFn(["tag3", "tag4"], filterValue)).toBe(true);
      });

      it("should return false when input includes any filter value", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "exclude",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(__multiOptionFilterFn(["tag1", "tag3"], filterValue)).toBe(
          false
        );
        expect(__multiOptionFilterFn(["tag2"], filterValue)).toBe(false);
      });
    });

    describe("exclude if any of operator", () => {
      it("should return true when input excludes all filter values", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "exclude if any of",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(__multiOptionFilterFn(["tag3", "tag4"], filterValue)).toBe(true);
      });

      it("should return false when input includes any filter value", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "exclude if any of",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(__multiOptionFilterFn(["tag1", "tag3"], filterValue)).toBe(
          false
        );
        expect(__multiOptionFilterFn(["tag2"], filterValue)).toBe(false);
      });
    });

    describe("include all of operator", () => {
      it("should return true when input includes all filter values", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "include all of",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(
          __multiOptionFilterFn(["tag1", "tag2", "tag3"], filterValue)
        ).toBe(true);
        expect(__multiOptionFilterFn(["tag1", "tag2"], filterValue)).toBe(true);
      });

      it("should return false when input does not include all filter values", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "include all of",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(__multiOptionFilterFn(["tag1"], filterValue)).toBe(false);
        expect(__multiOptionFilterFn(["tag2", "tag3"], filterValue)).toBe(
          false
        );
        expect(__multiOptionFilterFn(["tag3", "tag4"], filterValue)).toBe(
          false
        );
      });
    });

    describe("exclude if all operator", () => {
      it("should return false when input includes all filter values", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "exclude if all",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(
          __multiOptionFilterFn(["tag1", "tag2", "tag3"], filterValue)
        ).toBe(false);
        expect(__multiOptionFilterFn(["tag1", "tag2"], filterValue)).toBe(
          false
        );
      });

      it("should return true when input does not include all filter values", () => {
        const filterValue: FilterValue<"multiOption", TestData> = {
          operator: "exclude if all",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        };

        expect(__multiOptionFilterFn(["tag1"], filterValue)).toBe(true);
        expect(__multiOptionFilterFn(["tag2", "tag3"], filterValue)).toBe(true);
        expect(__multiOptionFilterFn(["tag3", "tag4"], filterValue)).toBe(true);
      });
    });

    it("should handle duplicate values in input and filter", () => {
      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["tag1", "tag1", "tag2"]],
        columnMeta: { type: "multiOption" },
      };

      // Mock uniq to return unique values
      (uniq as ReturnType<typeof vi.fn>).mockImplementation(
        (arr: unknown[]) => [...new Set(arr)]
      );

      expect(__multiOptionFilterFn(["tag1", "tag1", "tag3"], filterValue)).toBe(
        true
      );

      // Verify uniq was called to remove duplicates
      expect(uniq).toHaveBeenCalledWith(["tag1", "tag1", "tag3"]);
      expect(uniq).toHaveBeenCalledWith(["tag1", "tag1", "tag2"]);
    });
  });

  describe("multiOptionFilterFn", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should return false when row value is falsy", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(null),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["tag1"]],
        columnMeta: { type: "multiOption" },
      };

      const result = multiOptionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false);
    });

    it("should return false when columnMeta is missing", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(["tag1"]),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["tag1"]],
        columnMeta: undefined,
      };

      const result = multiOptionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false);
    });

    it("should handle string array values", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(["tag1", "tag2"]),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["tag1"]],
        columnMeta: { type: "multiOption" },
      };

      (isStringArray as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const result = multiOptionFilterFn(mockRow, "testColumn", filterValue);

      expect(isStringArray).toHaveBeenCalledWith(["tag1", "tag2"]);
      expect(result).toBe(true);
    });

    it("should handle column option array values", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue([
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ]),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["tag1"]],
        columnMeta: { type: "multiOption" },
      };

      (isStringArray as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );
      (
        isColumnOptionArray as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue(true);

      const result = multiOptionFilterFn(mockRow, "testColumn", filterValue);

      expect(isColumnOptionArray).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should handle custom values with transformOptionFn", () => {
      const mockTransformFn = vi.fn((item) => ({
        value: `transformed-${item}`,
        label: `transformed-${item}`,
      })) as (value: unknown) => ColumnOption;
      const mockRow = {
        getValue: vi.fn().mockReturnValue(["item1", "item2"]),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["transformed-item1"]],
        columnMeta: {
          type: "multiOption",
          transformOptionFn: mockTransformFn,
        },
      };

      (isStringArray as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );
      (
        isColumnOptionArray as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue(false);

      const result = multiOptionFilterFn(mockRow, "testColumn", filterValue);

      expect(mockTransformFn).toHaveBeenCalledWith("item1");
      expect(mockTransformFn).toHaveBeenCalledWith("item2");
      expect(result).toBe(true);
    });

    it("should return false when transformOptionFn is missing", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(["item1", "item2"]),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["tag1"]],
        columnMeta: { type: "multiOption" },
      };

      (isStringArray as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );
      (
        isColumnOptionArray as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue(false);

      const result = multiOptionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false);
    });

    it("should filter out falsy values from transformed data", () => {
      const mockTransformFn = vi
        .fn()
        .mockReturnValueOnce({ value: "transformed-item1" })
        .mockReturnValueOnce(null)
        .mockReturnValueOnce({ value: "transformed-item3" })
        .mockReturnValueOnce(undefined);

      const mockRow = {
        getValue: vi.fn().mockReturnValue(["item1", "item2", "item3", "item4"]),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["transformed-item1"]],
        columnMeta: {
          type: "multiOption",
          transformOptionFn: mockTransformFn,
        },
      };

      (isStringArray as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );
      (
        isColumnOptionArray as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue(false);

      const result = multiOptionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(true);
    });

    it("should handle transformed values with undefined value property", () => {
      const mockTransformFn = vi
        .fn()
        .mockReturnValueOnce({ value: "transformed-item1" })
        .mockReturnValueOnce({ value: undefined })
        .mockReturnValueOnce({ label: "No Value" }); // Missing value property

      const mockRow = {
        getValue: vi.fn().mockReturnValue(["item1", "item2", "item3"]),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"multiOption", TestData> = {
        operator: "include",
        values: [["transformed-item1"]],
        columnMeta: {
          type: "multiOption",
          transformOptionFn: mockTransformFn,
        },
      };

      (isStringArray as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );
      (
        isColumnOptionArray as unknown as ReturnType<typeof vi.fn>
      ).mockReturnValue(false);

      const result = multiOptionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(true);
    });
  });
});
