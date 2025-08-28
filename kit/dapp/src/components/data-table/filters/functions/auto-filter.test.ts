/**
 * @vitest-environment node
 */
import { describe, it, expect, vi } from "vitest";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";

interface TestData {
  id: string;
  name: string;
  age: number;
  date: Date;
  status: string;
  test?: string;
}
import {
  getAutoFilterFn,
  withAutoFilterFn,
  withAutoFilterFns,
} from "./auto-filter";

// Mock the filter functions
vi.mock("./flexible-filter-wrappers", () => ({
  flexibleNumberFilterFn: vi.fn().mockImplementation(() => true),
  flexibleTextFilterFn: vi.fn().mockImplementation(() => true),
}));

vi.mock("./date-filter", () => ({
  dateFilterFn: vi.fn().mockImplementation(() => true),
}));

vi.mock("./multi-option-filter", () => ({
  multiOptionFilterFn: vi.fn().mockImplementation(() => true),
}));

vi.mock("./option-filter", () => ({
  optionFilterFn: vi.fn().mockImplementation(() => true),
}));

import {
  flexibleNumberFilterFn,
  flexibleTextFilterFn,
} from "./flexible-filter-wrappers";
import { dateFilterFn } from "./date-filter";
import { multiOptionFilterFn } from "./multi-option-filter";
import { optionFilterFn } from "./option-filter";

describe("auto-filter", () => {
  describe("getAutoFilterFn", () => {
    it("should return text filter for text-based types", () => {
      expect(getAutoFilterFn("text")).toBe(flexibleTextFilterFn);
      expect(getAutoFilterFn("address")).toBe(flexibleTextFilterFn);
    });

    it("should return number filter for number-based types", () => {
      expect(getAutoFilterFn("number")).toBe(flexibleNumberFilterFn);
      expect(getAutoFilterFn("currency")).toBe(flexibleNumberFilterFn);
      expect(getAutoFilterFn("percentage")).toBe(flexibleNumberFilterFn);
      expect(getAutoFilterFn("basisPoints")).toBe(flexibleNumberFilterFn);
    });

    it("should return date filter for date-based types", () => {
      expect(getAutoFilterFn("date")).toBe(dateFilterFn);
    });

    it("should return multi-option filter for multi-select types", () => {
      expect(getAutoFilterFn("multiOption")).toBe(multiOptionFilterFn);
    });

    it("should return option filter for option and status types", () => {
      expect(getAutoFilterFn("option")).toBe(optionFilterFn);
      expect(getAutoFilterFn("status")).toBe(optionFilterFn);
    });

    it("should return text filter for text-like types", () => {
      expect(getAutoFilterFn("boolean")).toBe(flexibleTextFilterFn);
      expect(getAutoFilterFn("none")).toBe(flexibleTextFilterFn);
    });

    it("should return text filter as fallback for unknown types", () => {
      // @ts-expect-error Testing fallback behavior with invalid type
      expect(getAutoFilterFn("unknown")).toBe(flexibleTextFilterFn);
      // @ts-expect-error Testing fallback behavior with invalid type
      expect(getAutoFilterFn("custom")).toBe(flexibleTextFilterFn);
      // @ts-expect-error Testing fallback behavior with invalid type
      expect(getAutoFilterFn("nonexistent")).toBe(flexibleTextFilterFn);
    });

    it("should return text filter when no type provided", () => {
      expect(getAutoFilterFn()).toBe(flexibleTextFilterFn);
      expect(getAutoFilterFn(undefined)).toBe(flexibleTextFilterFn);
    });

    it("should handle empty string type", () => {
      // @ts-expect-error Testing fallback behavior with invalid type
      expect(getAutoFilterFn("")).toBe(flexibleTextFilterFn);
    });
  });

  describe("withAutoFilterFn", () => {
    it("should preserve existing filterFn when present", () => {
      const customFilterFn = vi.fn() as FilterFn<TestData>;
      const column: ColumnDef<TestData> = {
        accessorKey: "test",
        filterFn: customFilterFn,
        meta: { type: "number" },
      };

      const result = withAutoFilterFn(column);
      expect(result.filterFn).toBe(customFilterFn);
      expect(result.filterFn).not.toBe(flexibleNumberFilterFn);
    });

    it("should not add filterFn when enableColumnFilter is false", () => {
      const column: ColumnDef<TestData> = {
        accessorKey: "test",
        enableColumnFilter: false,
        meta: { type: "number" },
      };

      const result = withAutoFilterFn(column);
      expect(result.filterFn).toBeUndefined();
    });

    it("should apply filter function based on meta.type", () => {
      const testCases: Array<{
        type:
          | "text"
          | "number"
          | "date"
          | "multiOption"
          | "basisPoints"
          | "option"
          | "boolean"
          | "status";
        expectedFn: unknown;
      }> = [
        { type: "text", expectedFn: flexibleTextFilterFn },
        { type: "number", expectedFn: flexibleNumberFilterFn },
        { type: "date", expectedFn: dateFilterFn },
        { type: "multiOption", expectedFn: multiOptionFilterFn },
        { type: "basisPoints", expectedFn: flexibleNumberFilterFn },
        { type: "option", expectedFn: optionFilterFn },
        { type: "status", expectedFn: optionFilterFn },
        { type: "boolean", expectedFn: flexibleTextFilterFn },
      ];

      testCases.forEach(({ type, expectedFn }) => {
        const column: ColumnDef<TestData> = {
          accessorKey: "test",
          meta: { type },
        };

        const result = withAutoFilterFn(column);
        expect(result.filterFn).toEqual(expectedFn);
      });
    });

    it("should not modify column without accessor or type", () => {
      const column: ColumnDef<TestData> = {
        id: "test",
        header: "Test",
      };

      const result = withAutoFilterFn(column);
      expect(result).toBe(column);
      expect(result.filterFn).toBeUndefined();
    });

    it("should not modify column with type 'none'", () => {
      const column: ColumnDef<TestData> = {
        accessorKey: "test",
        meta: { type: "none" },
      };

      const result = withAutoFilterFn(column);
      expect(result).toBe(column);
      expect(result.filterFn).toBeUndefined();
    });

    it("should not modify column when no meta object is present", () => {
      const column: ColumnDef<TestData> = {
        accessorKey: "test",
      };

      const result = withAutoFilterFn(column);
      expect(result).toBe(column);
      expect(result.filterFn).toBeUndefined();
    });

    it("should preserve all other column properties", () => {
      const column: ColumnDef<TestData> = {
        accessorKey: "test",
        header: "Test Header",
        size: 200,
        enableSorting: false,
        meta: {
          type: "number",
          displayName: "Test Display",
        },
      };

      const result = withAutoFilterFn(column);
      expect(result.header).toBe("Test Header");
      expect(result.size).toBe(200);
      expect(result.enableSorting).toBe(false);
      expect(result.meta?.displayName).toBe("Test Display");
      expect(result.filterFn).toBe(flexibleNumberFilterFn);
    });

    it("should handle column with both accessorKey and accessorFn", () => {
      const column: ColumnDef<TestData> = {
        accessorKey: "test",
        accessorFn: (row) => row.test || "",
        meta: { type: "currency" },
      };

      const result = withAutoFilterFn(column);
      expect(result.filterFn).toBe(flexibleNumberFilterFn);
    });

    it("should handle column with additional meta properties", () => {
      const column: ColumnDef<TestData> = {
        accessorKey: "test",
        meta: {
          displayName: "Test Column",
          type: "text",
        },
      };

      const result = withAutoFilterFn(column);
      expect(result.filterFn).toBe(flexibleTextFilterFn);
      expect(result.meta?.displayName).toBe("Test Column");
    });
  });

  describe("withAutoFilterFns", () => {
    it("should apply withAutoFilterFn to all columns in array", () => {
      const columns: ColumnDef<TestData>[] = [
        { accessorKey: "name", meta: { type: "text" } },
        { accessorKey: "age", meta: { type: "number" } },
        { accessorKey: "joinDate", meta: { type: "date" } },
        { accessorKey: "status", meta: { type: "multiOption" } },
      ];

      const result = withAutoFilterFns(columns);

      expect(result).toHaveLength(4);
      expect(result[0]?.filterFn).toEqual(flexibleTextFilterFn);
      expect(result[1]?.filterFn).toEqual(flexibleNumberFilterFn);
      expect(result[2]?.filterFn).toEqual(dateFilterFn);
      expect(result[3]?.filterFn).toEqual(multiOptionFilterFn);
    });

    it("should handle empty array", () => {
      const result = withAutoFilterFns([]);
      expect(result).toEqual([]);
    });

    it("should handle array with mixed column types", () => {
      const customFilterFn = vi.fn() as FilterFn<TestData>;
      const columns: ColumnDef<TestData>[] = [
        { accessorKey: "name", meta: { type: "text" } },
        { accessorKey: "age", filterFn: customFilterFn }, // Has custom filter
        { id: "actions" }, // No accessor or type
        { accessorKey: "email", enableColumnFilter: false }, // Filter disabled
        { accessorKey: "status", meta: { type: "none" } }, // Type none - should not get filter
      ];

      const result = withAutoFilterFns(columns);

      expect(result).toHaveLength(5);
      expect(result[0]?.filterFn).toBe(flexibleTextFilterFn);
      expect(result[1]?.filterFn).toBe(customFilterFn);
      expect(result[2]?.filterFn).toBeUndefined();
      expect(result[3]?.filterFn).toBeUndefined();
      expect(result[4]?.filterFn).toBeUndefined(); // none type should not get filter
    });

    it("should preserve original array structure", () => {
      const columns: ColumnDef<TestData>[] = [
        {
          accessorKey: "test1",
          header: "Test 1",
          meta: { type: "text" },
        },
        {
          accessorKey: "test2",
          header: "Test 2",
          meta: { type: "number" },
        },
      ];

      const result = withAutoFilterFns(columns);

      expect(result[0]?.header).toBe("Test 1");
      expect(result[1]?.header).toBe("Test 2");
    });

    it("should not mutate original columns array", () => {
      const columns: ColumnDef<TestData>[] = [
        { accessorKey: "name", meta: { type: "text" } },
        { accessorKey: "age", meta: { type: "number" } },
      ];

      const originalColumns = [...columns];
      const result = withAutoFilterFns(columns);

      // Original array should be unchanged
      expect(columns).toEqual(originalColumns);
      expect(columns[0]?.filterFn).toBeUndefined();
      expect(columns[1]?.filterFn).toBeUndefined();

      // Result should have filter functions
      expect(result[0]?.filterFn).toBe(flexibleTextFilterFn);
      expect(result[1]?.filterFn).toBe(flexibleNumberFilterFn);
    });
  });
});
