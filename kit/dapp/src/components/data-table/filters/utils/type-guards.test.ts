/**
 * @vitest-environment node
 */
import { describe, it, expect } from "vitest";
import {
  isColumnOption,
  isColumnOptionArray,
  isStringArray,
} from "./type-guards";
import type { ColumnOption } from "../types/column-types";

describe("type-guards", () => {
  describe("isColumnOption", () => {
    it("should return true for valid ColumnOption objects", () => {
      const validOption: ColumnOption = { value: "test", label: "Test" };
      expect(isColumnOption(validOption)).toBe(true);
    });

    it("should return true for ColumnOption with additional properties", () => {
      const optionWithExtra = { value: "test", label: "Test", extra: "data" };
      expect(isColumnOption(optionWithExtra)).toBe(true);
    });

    it("should return true for ColumnOption with different value types", () => {
      expect(isColumnOption({ value: 123, label: "Number" })).toBe(true);
      expect(isColumnOption({ value: true, label: "Boolean" })).toBe(true);
      expect(isColumnOption({ value: null, label: "Null" })).toBe(true);
      expect(isColumnOption({ value: undefined, label: "Undefined" })).toBe(
        true
      );
    });

    it("should return false for objects missing value property", () => {
      expect(isColumnOption({ label: "Test" })).toBe(false);
    });

    it("should return false for objects missing label property", () => {
      expect(isColumnOption({ value: "test" })).toBe(false);
    });

    it("should return false for empty objects", () => {
      expect(isColumnOption({})).toBe(false);
    });

    it("should return false for null", () => {
      expect(isColumnOption(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isColumnOption(undefined)).toBe(false);
    });

    it("should return false for primitive values", () => {
      expect(isColumnOption("string")).toBe(false);
      expect(isColumnOption(123)).toBe(false);
      expect(isColumnOption(true)).toBe(false);
    });

    it("should return false for arrays", () => {
      expect(isColumnOption([])).toBe(false);
      expect(isColumnOption([{ value: "test", label: "Test" }])).toBe(false);
    });

    it("should return false for functions", () => {
      expect(isColumnOption(() => {})).toBe(false);
    });

    it("should handle objects with null prototype", () => {
      const objWithNullProto = Object.create(null);
      objWithNullProto.value = "test";
      objWithNullProto.label = "Test";
      expect(isColumnOption(objWithNullProto)).toBe(true);
    });

    it("should handle objects with inherited properties", () => {
      class BaseOption {
        value = "base";
      }
      class ExtendedOption extends BaseOption {
        label = "Extended";
      }
      const extended = new ExtendedOption();
      expect(isColumnOption(extended)).toBe(true);
    });
  });

  describe("isColumnOptionArray", () => {
    it("should return true for empty array", () => {
      expect(isColumnOptionArray([])).toBe(true);
    });

    it("should return true for array of valid ColumnOptions", () => {
      const options: ColumnOption[] = [
        { value: "1", label: "One" },
        { value: "2", label: "Two" },
        { value: "3", label: "Three" },
      ];
      expect(isColumnOptionArray(options)).toBe(true);
    });

    it("should return true for single item array", () => {
      expect(isColumnOptionArray([{ value: "test", label: "Test" }])).toBe(
        true
      );
    });

    it("should return false for array with invalid items", () => {
      expect(isColumnOptionArray([{ value: "test" }])).toBe(false);
      expect(isColumnOptionArray([{ label: "Test" }])).toBe(false);
      expect(isColumnOptionArray([{}])).toBe(false);
    });

    it("should return false for mixed valid and invalid items", () => {
      const mixed = [
        { value: "1", label: "One" },
        { value: "2" }, // Missing label
        { value: "3", label: "Three" },
      ];
      expect(isColumnOptionArray(mixed)).toBe(false);
    });

    it("should return false for array containing non-objects", () => {
      expect(isColumnOptionArray(["string"])).toBe(false);
      expect(isColumnOptionArray([123])).toBe(false);
      expect(isColumnOptionArray([null])).toBe(false);
      expect(isColumnOptionArray([undefined])).toBe(false);
    });

    it("should return false for non-array values", () => {
      expect(isColumnOptionArray(null)).toBe(false);
      expect(isColumnOptionArray(undefined)).toBe(false);
      expect(isColumnOptionArray("array")).toBe(false);
      expect(isColumnOptionArray(123)).toBe(false);
      expect(isColumnOptionArray({})).toBe(false);
      expect(isColumnOptionArray({ value: "test", label: "Test" })).toBe(false);
    });

    it("should handle array-like objects", () => {
      const arrayLike = { 0: { value: "test", label: "Test" }, length: 1 };
      expect(isColumnOptionArray(arrayLike)).toBe(false);
    });

    it("should handle arrays with nested arrays", () => {
      const nested = [[{ value: "test", label: "Test" }]];
      expect(isColumnOptionArray(nested)).toBe(false);
    });
  });

  describe("isStringArray", () => {
    it("should return true for empty array", () => {
      expect(isStringArray([])).toBe(true);
    });

    it("should return true for array of strings", () => {
      expect(isStringArray(["one", "two", "three"])).toBe(true);
      expect(isStringArray([""])).toBe(true);
      expect(isStringArray(["single"])).toBe(true);
    });

    it("should return true for array with empty strings", () => {
      expect(isStringArray(["", "test", ""])).toBe(true);
    });

    it("should return false for array containing non-strings", () => {
      expect(isStringArray([123])).toBe(false);
      expect(isStringArray([true])).toBe(false);
      expect(isStringArray([null])).toBe(false);
      expect(isStringArray([undefined])).toBe(false);
      expect(isStringArray([{}])).toBe(false);
      expect(isStringArray([[]])).toBe(false);
    });

    it("should return false for mixed string and non-string arrays", () => {
      expect(isStringArray(["string", 123])).toBe(false);
      expect(isStringArray(["one", "two", null])).toBe(false);
      expect(isStringArray(["test", undefined, "test"])).toBe(false);
    });

    it("should return false for non-array values", () => {
      expect(isStringArray(null)).toBe(false);
      expect(isStringArray(undefined)).toBe(false);
      expect(isStringArray("string")).toBe(false);
      expect(isStringArray(123)).toBe(false);
      expect(isStringArray(true)).toBe(false);
      expect(isStringArray({})).toBe(false);
    });

    it("should handle array-like objects", () => {
      const arrayLike = { 0: "test", length: 1 };
      expect(isStringArray(arrayLike)).toBe(false);
    });

    it("should handle String objects", () => {
      // Note: new String() creates an object, not a primitive string
      expect(isStringArray([{} as unknown])).toBe(false);
    });

    it("should handle very large arrays efficiently", () => {
      const largeArray = Array.from({ length: 1000 }).fill("test");
      expect(isStringArray(largeArray)).toBe(true);
    });

    it("should short-circuit on first non-string", () => {
      const mixed = [
        "string",
        123,
        ...Array.from({ length: 1000 }).fill("test"),
      ];
      expect(isStringArray(mixed)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("should handle Symbol values", () => {
      const sym = Symbol("test");
      expect(isColumnOption(sym)).toBe(false);
      expect(isColumnOptionArray([sym])).toBe(false);
      expect(isStringArray([sym])).toBe(false);
    });

    it("should handle BigInt values", () => {
      const bigInt = 123n;
      expect(isColumnOption(bigInt)).toBe(false);
      expect(isColumnOptionArray([bigInt])).toBe(false);
      expect(isStringArray([bigInt])).toBe(false);
    });

    it("should handle circular references in objects", () => {
      const circular: Record<string, unknown> = {
        value: "test",
        label: "Test",
      };
      circular.self = circular;
      expect(isColumnOption(circular)).toBe(true); // Still has value and label
    });

    it("should handle frozen objects", () => {
      const frozen = Object.freeze({ value: "test", label: "Test" });
      expect(isColumnOption(frozen)).toBe(true);
    });

    it("should handle sealed objects", () => {
      const sealed = Object.seal({ value: "test", label: "Test" });
      expect(isColumnOption(sealed)).toBe(true);
    });
  });
});
