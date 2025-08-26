/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Row } from "@tanstack/react-table";
import {
  flexibleNumberFilterFn,
  flexibleTextFilterFn,
} from "./flexible-filter-wrappers";
import type { FilterValue } from "../types/filter-types";
// Define test data type
interface TestData {
  id: string;
  name: string;
}

// Mock the underlying filter functions
vi.mock("./number-filter", () => ({
  numberFilterFn: vi.fn().mockReturnValue(true),
}));

vi.mock("./text-filter", () => ({
  textFilterFn: vi.fn().mockReturnValue(true),
}));

import { numberFilterFn } from "./number-filter";
import { textFilterFn } from "./text-filter";

describe("flexible-filter-wrappers", () => {
  const mockRow = {
    getValue: vi.fn().mockReturnValue("test"),
  } as unknown as Row<TestData>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("flexibleNumberFilterFn", () => {
    it("should handle simple string number values", () => {
      flexibleNumberFilterFn(mockRow, "testColumn", "123");

      expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "is",
        values: [123],
        columnMeta: undefined,
      });
    });

    it("should handle simple number values", () => {
      flexibleNumberFilterFn(mockRow, "testColumn", 456);

      expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "is",
        values: [456],
        columnMeta: undefined,
      });
    });

    it("should handle floating point string values", () => {
      flexibleNumberFilterFn(mockRow, "testColumn", "123.45");

      expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "is",
        values: [123.45],
        columnMeta: undefined,
      });
    });

    it("should handle floating point number values", () => {
      flexibleNumberFilterFn(mockRow, "testColumn", 456.78);

      expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "is",
        values: [456.78],
        columnMeta: undefined,
      });
    });

    it("should handle zero values", () => {
      flexibleNumberFilterFn(mockRow, "testColumn", 0);

      expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "is",
        values: [0],
        columnMeta: undefined,
      });

      flexibleNumberFilterFn(mockRow, "testColumn", "0");

      expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "is",
        values: [0],
        columnMeta: undefined,
      });
    });

    it("should handle negative numbers", () => {
      flexibleNumberFilterFn(mockRow, "testColumn", -123);

      expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "is",
        values: [-123],
        columnMeta: undefined,
      });

      flexibleNumberFilterFn(mockRow, "testColumn", "-456");

      expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "is",
        values: [-456],
        columnMeta: undefined,
      });
    });

    it("should return true for invalid string numbers", () => {
      const result = flexibleNumberFilterFn(mockRow, "testColumn", "invalid");

      expect(result).toBe(true);
      expect(numberFilterFn).not.toHaveBeenCalled();
    });

    it("should return true for empty string", () => {
      const result = flexibleNumberFilterFn(mockRow, "testColumn", "");

      expect(result).toBe(true);
      expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "is",
        values: [0], // Empty string converts to 0
        columnMeta: undefined,
      });
    });

    it("should return true for non-numeric strings", () => {
      const result = flexibleNumberFilterFn(mockRow, "testColumn", "abc");

      expect(result).toBe(true);
      expect(numberFilterFn).not.toHaveBeenCalled();
    });

    it("should handle complex filter objects directly", () => {
      const complexFilter: FilterValue<"number", TestData> = {
        operator: "is between",
        values: [10, 20],
        columnMeta: { type: "number" },
      };

      flexibleNumberFilterFn(mockRow, "testColumn", complexFilter);

      expect(numberFilterFn).toHaveBeenCalledWith(
        mockRow,
        "testColumn",
        complexFilter
      );
    });

    it("should pass through all operators in complex filters", () => {
      const operators = [
        "is",
        "is not",
        "is greater than",
        "is greater than or equal to",
        "is less than",
        "is less than or equal to",
        "is between",
        "is not between",
      ] as const;

      operators.forEach((operator) => {
        const complexFilter: FilterValue<"number", TestData> = {
          operator,
          values: [10, 20],
          columnMeta: { type: "number" },
        };

        flexibleNumberFilterFn(mockRow, "testColumn", complexFilter);

        expect(numberFilterFn).toHaveBeenCalledWith(
          mockRow,
          "testColumn",
          complexFilter
        );
      });
    });

    it("should handle edge case numeric strings", () => {
      const testCases = [
        { input: "123.0", expected: 123 },
        { input: "0.0", expected: 0 },
        { input: "-0", expected: -0 },
        { input: "1e2", expected: 100 },
        { input: "1.23e-2", expected: 0.0123 },
        { input: "Infinity", expected: Infinity },
        { input: "-Infinity", expected: -Infinity },
      ];

      testCases.forEach(({ input, expected }) => {
        flexibleNumberFilterFn(mockRow, "testColumn", input);

        expect(numberFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
          operator: "is",
          values: [expected],
          columnMeta: undefined,
        });
      });
    });

    it("should handle NaN edge case", () => {
      const result = flexibleNumberFilterFn(mockRow, "testColumn", "NaN");

      expect(result).toBe(true);
      expect(numberFilterFn).not.toHaveBeenCalled();
    });
  });

  describe("flexibleTextFilterFn", () => {
    it("should handle simple string values", () => {
      flexibleTextFilterFn(mockRow, "testColumn", "test string");

      expect(textFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "contains",
        values: ["test string"],
        columnMeta: undefined,
      });
    });

    it("should handle empty string values", () => {
      flexibleTextFilterFn(mockRow, "testColumn", "");

      expect(textFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "contains",
        values: [""],
        columnMeta: undefined,
      });
    });

    it("should handle strings with special characters", () => {
      const specialString = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      flexibleTextFilterFn(mockRow, "testColumn", specialString);

      expect(textFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "contains",
        values: [specialString],
        columnMeta: undefined,
      });
    });

    it("should handle unicode strings", () => {
      const unicodeString = "Hello 🌍 café naïve résumé";

      flexibleTextFilterFn(mockRow, "testColumn", unicodeString);

      expect(textFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "contains",
        values: [unicodeString],
        columnMeta: undefined,
      });
    });

    it("should handle very long strings", () => {
      const longString = "a".repeat(1000);

      flexibleTextFilterFn(mockRow, "testColumn", longString);

      expect(textFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "contains",
        values: [longString],
        columnMeta: undefined,
      });
    });

    it("should handle strings that look like numbers", () => {
      flexibleTextFilterFn(mockRow, "testColumn", "123");

      expect(textFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "contains",
        values: ["123"],
        columnMeta: undefined,
      });
    });

    it("should handle whitespace strings", () => {
      flexibleTextFilterFn(mockRow, "testColumn", "   ");

      expect(textFilterFn).toHaveBeenCalledWith(mockRow, "testColumn", {
        operator: "contains",
        values: ["   "],
        columnMeta: undefined,
      });
    });

    it("should handle complex filter objects directly", () => {
      const complexFilter: FilterValue<"text", TestData> = {
        operator: "does not contain",
        values: ["exclude this"],
        columnMeta: { type: "text" },
      };

      flexibleTextFilterFn(mockRow, "testColumn", complexFilter);

      expect(textFilterFn).toHaveBeenCalledWith(
        mockRow,
        "testColumn",
        complexFilter
      );
    });

    it("should pass through all operators in complex filters", () => {
      const operators = ["contains", "does not contain"] as const;

      operators.forEach((operator) => {
        const complexFilter: FilterValue<"text", TestData> = {
          operator,
          values: ["test"],
          columnMeta: { type: "text" },
        };

        flexibleTextFilterFn(mockRow, "testColumn", complexFilter);

        expect(textFilterFn).toHaveBeenCalledWith(
          mockRow,
          "testColumn",
          complexFilter
        );
      });
    });

    it("should preserve columnMeta in complex filters", () => {
      const complexFilter: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["test"],
        columnMeta: {
          type: "text",
          displayName: "Test Column",
        },
      };

      flexibleTextFilterFn(mockRow, "testColumn", complexFilter);

      expect(textFilterFn).toHaveBeenCalledWith(
        mockRow,
        "testColumn",
        complexFilter
      );
    });

    it("should handle complex filters with multiple values", () => {
      const complexFilter: FilterValue<"text", TestData> = {
        operator: "contains",
        values: ["value1", "value2", "value3"],
        columnMeta: { type: "text" },
      };

      flexibleTextFilterFn(mockRow, "testColumn", complexFilter);

      expect(textFilterFn).toHaveBeenCalledWith(
        mockRow,
        "testColumn",
        complexFilter
      );
    });

    it("should handle complex filters with empty values array", () => {
      const complexFilter: FilterValue<"text", TestData> = {
        operator: "contains",
        values: [],
        columnMeta: { type: "text" },
      };

      flexibleTextFilterFn(mockRow, "testColumn", complexFilter);

      expect(textFilterFn).toHaveBeenCalledWith(
        mockRow,
        "testColumn",
        complexFilter
      );
    });
  });

  describe("integration behavior", () => {
    it("should maintain consistent return values", () => {
      (numberFilterFn as ReturnType<typeof vi.fn>).mockReturnValue(false);
      (textFilterFn as ReturnType<typeof vi.fn>).mockReturnValue(false);

      expect(flexibleNumberFilterFn(mockRow, "col", 123)).toBe(false);
      expect(flexibleTextFilterFn(mockRow, "col", "test")).toBe(false);

      (numberFilterFn as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (textFilterFn as ReturnType<typeof vi.fn>).mockReturnValue(true);

      expect(flexibleNumberFilterFn(mockRow, "col", 123)).toBe(true);
      expect(flexibleTextFilterFn(mockRow, "col", "test")).toBe(true);
    });

    it("should handle consecutive calls with different filter types", () => {
      flexibleNumberFilterFn(mockRow, "col1", 123);
      flexibleTextFilterFn(mockRow, "col2", "test");
      flexibleNumberFilterFn(mockRow, "col3", "456");
      flexibleTextFilterFn(mockRow, "col4", {
        operator: "contains",
        values: ["complex"],
        columnMeta: { type: "text" },
      });

      expect(numberFilterFn).toHaveBeenCalledTimes(2);
      expect(textFilterFn).toHaveBeenCalledTimes(2);
    });
  });
});
