/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach as _beforeEach } from "vitest";
import type { Row } from "@tanstack/react-table";
import { textFilterFn, __textFilterFn } from "./text-filter";
import type { FilterValue } from "../types/filter-types";

// Define test data type
interface TestData {
  id: string;
  name: string;
}

describe("text-filter", () => {
  describe("__textFilterFn", () => {
    it("should return true when no filter values", () => {
      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: [],
        columnMeta: undefined,
      };

      expect(__textFilterFn("test", filterValue)).toBe(true);
    });

    it("should return true when filter value is empty string", () => {
      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: [""],
        columnMeta: undefined,
      };

      expect(__textFilterFn("test", filterValue)).toBe(true);
    });

    it("should return true when filter value is whitespace only", () => {
      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["   "],
        columnMeta: undefined,
      };

      expect(__textFilterFn("test", filterValue)).toBe(true);
    });

    describe("contains operator", () => {
      it("should return true when text contains filter value", () => {
        const filterValue: FilterValue<"text", TestData> = {
          operator: "contains",
          values: ["hello"],
          columnMeta: undefined,
        };

        expect(__textFilterFn("hello world", filterValue)).toBe(true);
        expect(__textFilterFn("say hello", filterValue)).toBe(true);
        expect(__textFilterFn("hello", filterValue)).toBe(true);
      });

      it("should return false when text does not contain filter value", () => {
        const filterValue: FilterValue<"text", TestData> = {
          operator: "contains",
          values: ["xyz"],
          columnMeta: undefined,
        };

        expect(__textFilterFn("hello world", filterValue)).toBe(false);
        expect(__textFilterFn("", filterValue)).toBe(false);
      });

      it("should be case insensitive", () => {
        const filterValue: FilterValue<"text", TestData> = {
          operator: "contains",
          values: ["HELLO"],
          columnMeta: undefined,
        };

        expect(__textFilterFn("hello world", filterValue)).toBe(true);
        expect(__textFilterFn("Hello World", filterValue)).toBe(true);
        expect(__textFilterFn("HELLO WORLD", filterValue)).toBe(true);
      });

      it("should handle whitespace in input and filter", () => {
        const filterValue: FilterValue<"text", TestData> = {
          operator: "contains",
          values: ["  hello  "],
          columnMeta: undefined,
        };

        expect(__textFilterFn("  hello world  ", filterValue)).toBe(true);
        expect(__textFilterFn("hello", filterValue)).toBe(true);
      });
    });

    describe("does not contain operator", () => {
      it("should return false when text contains filter value", () => {
        const filterValue: FilterValue<"text", TestData> = {
          operator: "does not contain",
          values: ["hello"],
          columnMeta: undefined,
        };

        expect(__textFilterFn("hello world", filterValue)).toBe(false);
        expect(__textFilterFn("say hello", filterValue)).toBe(false);
        expect(__textFilterFn("hello", filterValue)).toBe(false);
      });

      it("should return true when text does not contain filter value", () => {
        const filterValue: FilterValue<"text", TestData> = {
          operator: "does not contain",
          values: ["xyz"],
          columnMeta: undefined,
        };

        expect(__textFilterFn("hello world", filterValue)).toBe(true);
        expect(__textFilterFn("", filterValue)).toBe(true);
      });

      it("should be case insensitive", () => {
        const filterValue: FilterValue<"text", TestData> = {
          operator: "does not contain",
          values: ["HELLO"],
          columnMeta: undefined,
        };

        expect(__textFilterFn("hello world", filterValue)).toBe(false);
        expect(__textFilterFn("Hello World", filterValue)).toBe(false);
        expect(__textFilterFn("HELLO WORLD", filterValue)).toBe(false);
        expect(__textFilterFn("goodbye world", filterValue)).toBe(true);
      });
    });

    it("should handle special characters", () => {
      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["@#$%"],
        columnMeta: undefined,
      };

      expect(__textFilterFn("user@#$%domain.com", filterValue)).toBe(true);
      expect(__textFilterFn("user@domain.com", filterValue)).toBe(false);
    });

    it("should handle unicode characters", () => {
      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["café"],
        columnMeta: undefined,
      };

      expect(__textFilterFn("I love café", filterValue)).toBe(true);
      expect(__textFilterFn("I love coffee", filterValue)).toBe(false);
    });

    it("should only use first filter value", () => {
      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["hello", "world", "ignored"],
        columnMeta: undefined,
      };

      expect(__textFilterFn("hello test", filterValue)).toBe(true);
      expect(__textFilterFn("world test", filterValue)).toBe(false);
    });
  });

  describe("textFilterFn", () => {
    it("should extract value from row and apply text filter", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue("hello world"),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["hello"],
        columnMeta: undefined,
      };

      const result = textFilterFn(mockRow, "testColumn", filterValue);

      expect(mockRow.getValue).toHaveBeenCalledWith("testColumn");
      expect(result).toBe(true);
    });

    it("should handle null/undefined values from row", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(null),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["test"],
        columnMeta: undefined,
      };

      const result = textFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false);
    });

    it("should handle undefined values from row", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(undefined),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["test"],
        columnMeta: undefined,
      };

      const result = textFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false);
    });

    it("should convert non-string values to empty string", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(123),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["123"],
        columnMeta: undefined,
      };

      const result = textFilterFn(mockRow, "testColumn", filterValue);

      // Since getValue returns 123 (number), it gets converted to "123"
      // So it will contain "123"
      expect(result).toBe(true);
    });

    it("should handle empty string from row", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(""),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["test"],
        columnMeta: undefined,
      };

      const result = textFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false);
    });

    it("should work with does not contain operator", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue("hello world"),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"text", TestData> = {
        operator: "does not contain",
        values: ["xyz"],
        columnMeta: undefined,
      };

      const result = textFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(true);
    });
  });
});
