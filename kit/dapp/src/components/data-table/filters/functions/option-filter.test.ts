/**
 * @vitest-environment node
 */
import type { Row } from "@tanstack/react-table";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FilterValue } from "../types/filter-types";
import { __optionFilterFn, optionFilterFn } from "./option-filter";

// Define test data type
interface TestData {
  id: string;
  name: string;
}

// Mock the type guards
vi.mock("../utils/type-guards", () => ({
  isColumnOption: vi.fn(
    (value) => typeof value === "object" && value !== null && "value" in value
  ),
}));

import { isColumnOption } from "../utils/type-guards";

describe("option-filter", () => {
  describe("__optionFilterFn", () => {
    it("should return true when no filter values", () => {
      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: [],
        columnMeta: { type: "option" },
      };

      expect(__optionFilterFn("test", filterValue)).toBe(true);
    });

    it("should return false when first filter value is falsy", () => {
      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: [null as unknown as string],
        columnMeta: { type: "option" },
      };

      expect(__optionFilterFn("test", filterValue)).toBe(false);
    });

    describe("is operator", () => {
      it("should return true when values match", () => {
        const filterValue: FilterValue<"option", TestData> = {
          operator: "is",
          values: ["test"],
          columnMeta: { type: "option" },
        };

        expect(__optionFilterFn("test", filterValue)).toBe(true);
      });

      it("should return false when values do not match", () => {
        const filterValue: FilterValue<"option", TestData> = {
          operator: "is",
          values: ["other"],
          columnMeta: { type: "option" },
        };

        expect(__optionFilterFn("test", filterValue)).toBe(false);
      });

      it("should handle case insensitivity", () => {
        const filterValue: FilterValue<"option", TestData> = {
          operator: "is",
          values: ["TEST"],
          columnMeta: { type: "option" },
        };

        expect(__optionFilterFn("test", filterValue)).toBe(true);
      });
    });

    describe("is not operator", () => {
      it("should return false when values match", () => {
        const filterValue: FilterValue<"option", TestData> = {
          operator: "is not",
          values: ["test"],
          columnMeta: { type: "option" },
        };

        expect(__optionFilterFn("test", filterValue)).toBe(false);
      });

      it("should return true when values do not match", () => {
        const filterValue: FilterValue<"option", TestData> = {
          operator: "is not",
          values: ["other"],
          columnMeta: { type: "option" },
        };

        expect(__optionFilterFn("test", filterValue)).toBe(true);
      });
    });

    it("should handle empty string values", () => {
      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: [""],
        columnMeta: { type: "option" },
      };

      expect(__optionFilterFn("", filterValue)).toBe(true);
      expect(__optionFilterFn("test", filterValue)).toBe(false);
    });

    it("should handle special characters", () => {
      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: ["@#$%^&*()"],
        columnMeta: { type: "option" },
      };

      expect(__optionFilterFn("@#$%^&*()", filterValue)).toBe(true);
      expect(__optionFilterFn("test", filterValue)).toBe(false);
    });

    it("should handle unicode characters", () => {
      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: ["café"],
        columnMeta: { type: "option" },
      };

      expect(__optionFilterFn("café", filterValue)).toBe(true);
      expect(__optionFilterFn("cafe", filterValue)).toBe(false);
    });
  });

  describe("optionFilterFn", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should return false when row value is falsy", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(null),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: ["test"],
        columnMeta: { type: "option" },
      };

      const result = optionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false);
    });

    it("should return false when columnMeta is missing", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue("test"),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: ["test"],
        columnMeta: undefined,
      };

      const result = optionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false);
    });

    it("should handle string values directly", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue("test"),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: ["test"],
        columnMeta: { type: "option" },
      };

      (isColumnOption as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      const result = optionFilterFn(mockRow, "testColumn", filterValue);

      // String values should not call isColumnOption (they're handled directly)
      expect(isColumnOption).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("should handle column option objects", () => {
      const mockRow = {
        getValue: vi
          .fn()
          .mockReturnValue({ value: "test", label: "Test Option" }),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: ["test"],
        columnMeta: { type: "option" },
      };

      (isColumnOption as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const result = optionFilterFn(mockRow, "testColumn", filterValue);

      expect(isColumnOption).toHaveBeenCalledWith({
        value: "test",
        label: "Test Option",
      });
      expect(result).toBe(true);
    });

    it("should handle custom values with transformOptionFn", () => {
      const mockTransformFn = vi
        .fn()
        .mockReturnValue({ value: "transformed-test" });
      const mockRow = {
        getValue: vi.fn().mockReturnValue({ customField: "test" }),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: ["transformed-test"],
        columnMeta: {
          type: "option",
          transformOptionFn: mockTransformFn,
        },
      };

      (isColumnOption as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      const result = optionFilterFn(mockRow, "testColumn", filterValue);

      expect(mockTransformFn).toHaveBeenCalledWith({ customField: "test" });
      expect(result).toBe(true);
    });

    it("should return false when transformOptionFn is missing for custom values", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue({ customField: "test" }),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: ["test"],
        columnMeta: { type: "option" },
      };

      (isColumnOption as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      const result = optionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false);
    });

    it("should return false when transformOptionFn returns falsy value", () => {
      const mockTransformFn = vi.fn().mockReturnValue(null);
      const mockRow = {
        getValue: vi.fn().mockReturnValue({ customField: "test" }),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: ["test"],
        columnMeta: {
          type: "option",
          transformOptionFn: mockTransformFn,
        },
      };

      (isColumnOption as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      const result = optionFilterFn(mockRow, "testColumn", filterValue);

      expect(mockTransformFn).toHaveBeenCalledWith({ customField: "test" });
      expect(result).toBe(false);
    });

    it("should work with is not operator", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue("test"),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"option", TestData> = {
        operator: "is not",
        values: ["other"],
        columnMeta: { type: "option" },
      };

      (isColumnOption as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      const result = optionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(true);
    });

    it("should handle edge case with empty string filter value", () => {
      const mockRow = {
        getValue: vi.fn().mockReturnValue(""),
      } as unknown as Row<TestData>;

      const filterValue: FilterValue<"option", TestData> = {
        operator: "is",
        values: [null as unknown as string], // Falsy filter value
        columnMeta: { type: "option" },
      };

      const result = optionFilterFn(mockRow, "testColumn", filterValue);

      expect(result).toBe(false); // Empty input returns false at line 12
    });
  });
});
