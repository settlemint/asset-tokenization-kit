/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import { filterFn } from "./filter-factory";
import { dateFilterFn } from "./date-filter";
import { multiOptionFilterFn } from "./multi-option-filter";
import { numberFilterFn } from "./number-filter";
import { optionFilterFn } from "./option-filter";
import { textFilterFn } from "./text-filter";
import type { ColumnDataType } from "../types/column-types";

describe("filter-factory", () => {
  describe("filterFn", () => {
    it("should return optionFilterFn for option type", () => {
      const result = filterFn("option");
      expect(result).toBe(optionFilterFn);
    });

    it("should return multiOptionFilterFn for multiOption type", () => {
      const result = filterFn("multiOption");
      expect(result).toBe(multiOptionFilterFn);
    });

    it("should return dateFilterFn for date type", () => {
      const result = filterFn("date");
      expect(result).toBe(dateFilterFn);
    });

    it("should return textFilterFn for text type", () => {
      const result = filterFn("text");
      expect(result).toBe(textFilterFn);
    });

    it("should return numberFilterFn for number type", () => {
      const result = filterFn("number");
      expect(result).toBe(numberFilterFn);
    });

    it("should throw error for invalid data type", () => {
      expect(() => {
        filterFn("invalid" as ColumnDataType);
      }).toThrow("Invalid column data type");
    });

    it("should throw error for undefined data type", () => {
      expect(() => {
        filterFn(undefined as ReturnType<typeof vi.fn>);
      }).toThrow("Invalid column data type");
    });

    it("should throw error for null data type", () => {
      expect(() => {
        filterFn(null as ReturnType<typeof vi.fn>);
      }).toThrow("Invalid column data type");
    });

    it("should throw error for empty string data type", () => {
      expect(() => {
        filterFn("" as ColumnDataType);
      }).toThrow("Invalid column data type");
    });

    it("should be case sensitive", () => {
      expect(() => {
        filterFn("TEXT" as ColumnDataType);
      }).toThrow("Invalid column data type");

      expect(() => {
        filterFn("Option" as ColumnDataType);
      }).toThrow("Invalid column data type");

      expect(() => {
        filterFn("DATE" as ColumnDataType);
      }).toThrow("Invalid column data type");
    });

    it("should handle all valid ColumnDataType values", () => {
      const validTypes: ColumnDataType[] = [
        "option",
        "multiOption",
        "date",
        "text",
        "number",
      ];

      validTypes.forEach((type) => {
        expect(() => filterFn(type)).not.toThrow();
      });
    });

    it("should return different functions for different types", () => {
      const optionFn = filterFn("option");
      const textFn = filterFn("text");
      const numberFn = filterFn("number");
      const dateFn = filterFn("date");
      const multiOptionFn = filterFn("multiOption");

      // All functions should be different
      expect(optionFn).not.toBe(textFn);
      expect(optionFn).not.toBe(numberFn);
      expect(optionFn).not.toBe(dateFn);
      expect(optionFn).not.toBe(multiOptionFn);

      expect(textFn).not.toBe(numberFn);
      expect(textFn).not.toBe(dateFn);
      expect(textFn).not.toBe(multiOptionFn);

      expect(numberFn).not.toBe(dateFn);
      expect(numberFn).not.toBe(multiOptionFn);

      expect(dateFn).not.toBe(multiOptionFn);
    });

    it("should return same function instance for same type", () => {
      const textFn1 = filterFn("text");
      const textFn2 = filterFn("text");
      expect(textFn1).toBe(textFn2);

      const numberFn1 = filterFn("number");
      const numberFn2 = filterFn("number");
      expect(numberFn1).toBe(numberFn2);
    });
  });
});
