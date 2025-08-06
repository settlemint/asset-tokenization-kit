/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  encodeObjectParam,
  decodeObjectParam,
  serializeDataTableState,
  deserializeDataTableState,
  tableStateToSearchParams,
  searchParamsToTableState,
  createMinimalSearchParams,
  createDebouncedUrlUpdate,
} from "./search-param-serializers";

describe("search-param-serializers", () => {
  describe("encodeObjectParam", () => {
    it("should encode non-empty objects to JSON string", () => {
      expect(encodeObjectParam({ foo: "bar" })).toBe('{"foo":"bar"}');
      expect(encodeObjectParam({ a: 1, b: 2 })).toBe('{"a":1,"b":2}');
    });

    it("should return undefined for empty objects", () => {
      expect(encodeObjectParam({})).toBeUndefined();
    });

    it("should handle complex nested objects", () => {
      const complex = { a: { b: { c: "nested" } }, arr: [1, 2, 3] };
      expect(encodeObjectParam(complex)).toBe(
        '{"a":{"b":{"c":"nested"}},"arr":[1,2,3]}'
      );
    });

    it("should return undefined for objects that cannot be serialized", () => {
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular; // Create circular reference
      expect(encodeObjectParam(circular)).toBeUndefined();
    });

    it("should handle objects with undefined values", () => {
      expect(encodeObjectParam({ a: undefined })).toBe("{}");
    });
  });

  describe("decodeObjectParam", () => {
    it("should decode valid JSON strings", () => {
      expect(decodeObjectParam('{"foo":"bar"}', {})).toEqual({ foo: "bar" });
      expect(decodeObjectParam('{"a":1,"b":2}', {})).toEqual({ a: 1, b: 2 });
    });

    it("should return fallback for undefined param", () => {
      const fallback = { default: true };
      expect(decodeObjectParam(undefined, fallback)).toBe(fallback);
    });

    it("should return fallback for empty string", () => {
      const fallback = { default: true };
      expect(decodeObjectParam("", fallback)).toBe(fallback);
    });

    it("should return fallback for invalid JSON", () => {
      const fallback = { default: true };
      expect(decodeObjectParam("invalid json", fallback)).toBe(fallback);
      expect(decodeObjectParam("{malformed", fallback)).toBe(fallback);
    });

    it("should handle null result", () => {
      const fallback = { default: true };
      expect(decodeObjectParam("null", fallback)).toBe(fallback);
    });
  });

  describe("serializeDataTableState", () => {
    it("should serialize pagination state", () => {
      const result = serializeDataTableState({
        pagination: { pageIndex: 1, pageSize: 20 },
      });
      expect(result).toEqual({ page: 2, pageSize: 20 });
    });

    it("should omit default page size", () => {
      const result = serializeDataTableState({
        pagination: { pageIndex: 1, pageSize: 10 },
      });
      expect(result).toEqual({ page: 2 });
    });

    it("should omit first page", () => {
      const result = serializeDataTableState({
        pagination: { pageIndex: 0, pageSize: 20 },
      });
      expect(result).toEqual({ pageSize: 20 });
    });

    it("should serialize sorting state", () => {
      const result = serializeDataTableState({
        sorting: [{ id: "name", desc: false }],
      });
      expect(result).toEqual({ sortBy: "name" });
    });

    it("should include sortOrder for descending", () => {
      const result = serializeDataTableState({
        sorting: [{ id: "name", desc: true }],
      });
      expect(result).toEqual({ sortBy: "name", sortOrder: "desc" });
    });

    it("should only use first sort column", () => {
      const result = serializeDataTableState({
        sorting: [
          { id: "name", desc: false },
          { id: "age", desc: true },
        ],
      });
      expect(result).toEqual({ sortBy: "name" });
    });

    it("should serialize simple column filters", () => {
      const result = serializeDataTableState({
        columnFilters: [
          { id: "status", value: "active" },
          { id: "type", value: 123 },
          { id: "enabled", value: true },
        ],
      });
      expect(result).toEqual({
        filter_status: "active",
        filter_type: "123",
        filter_enabled: "true",
      });
    });

    it("should handle complex filter structures", () => {
      const result = serializeDataTableState({
        columnFilters: [
          {
            id: "age",
            value: { operator: "between", values: [20, 30] },
          },
        ],
      });
      expect(result).toEqual({ filter_age: "20" });
    });

    it("should skip empty filter values", () => {
      const result = serializeDataTableState({
        columnFilters: [
          { id: "empty", value: "" },
          { id: "null", value: null },
          { id: "undefined", value: undefined },
          { id: "valid", value: "test" },
        ],
      });
      expect(result).toEqual({ filter_valid: "test" });
    });

    it("should skip complex filters with empty values", () => {
      const result = serializeDataTableState({
        columnFilters: [
          {
            id: "empty",
            value: { operator: "equals", values: [""] },
          },
          {
            id: "noValues",
            value: { operator: "equals", values: [] },
          },
        ],
      });
      expect(result).toEqual({});
    });

    it("should serialize global filter", () => {
      const result = serializeDataTableState({
        globalFilter: "search term",
      });
      expect(result).toEqual({ search: "search term" });
    });

    it("should skip empty global filter", () => {
      const result = serializeDataTableState({
        globalFilter: "  ",
      });
      expect(result).toEqual({});
    });

    it("should serialize column visibility", () => {
      const result = serializeDataTableState({
        columnVisibility: {
          name: true,
          age: false,
          status: true,
        },
      });
      expect(result).toEqual({ columns: "name,status" });
    });

    it("should skip column visibility if all hidden", () => {
      const result = serializeDataTableState({
        columnVisibility: {
          name: false,
          age: false,
        },
      });
      expect(result).toEqual({});
    });

    it("should serialize row selection", () => {
      const result = serializeDataTableState({
        rowSelection: {
          row1: true,
          row2: false,
          row3: true,
        },
      });
      expect(result).toEqual({ selected: "row1,row3" });
    });

    it("should handle empty states", () => {
      const result = serializeDataTableState({});
      expect(result).toEqual({});
    });

    it("should handle all states combined", () => {
      const result = serializeDataTableState({
        pagination: { pageIndex: 2, pageSize: 25 },
        sorting: [{ id: "name", desc: true }],
        columnFilters: [{ id: "status", value: "active" }],
        globalFilter: "search",
        columnVisibility: { name: true, age: true },
        rowSelection: { row1: true },
      });
      expect(result).toEqual({
        page: 3,
        pageSize: 25,
        sortBy: "name",
        sortOrder: "desc",
        filter_status: "active",
        search: "search",
        columns: "name,age",
        selected: "row1",
      });
    });

    it("should respect custom default page size", () => {
      const result = serializeDataTableState(
        {
          pagination: { pageIndex: 0, pageSize: 20 },
        },
        20
      );
      expect(result).toEqual({});
    });
  });

  describe("deserializeDataTableState", () => {
    it("should deserialize pagination", () => {
      const result = deserializeDataTableState({
        page: 2,
        pageSize: 20,
      });
      expect(result.pagination).toEqual({ pageIndex: 1, pageSize: 20 });
    });

    it("should handle invalid page values", () => {
      expect(deserializeDataTableState({ page: "invalid" }).pagination).toEqual(
        { pageIndex: 0, pageSize: 10 }
      );
      expect(deserializeDataTableState({ page: -1 }).pagination).toEqual({
        pageIndex: 0,
        pageSize: 10,
      });
      expect(deserializeDataTableState({ page: 2000 }).pagination).toEqual({
        pageIndex: 999,
        pageSize: 10,
      });
    });

    it("should handle invalid pageSize values", () => {
      expect(
        deserializeDataTableState({ pageSize: "invalid" }).pagination
      ).toEqual({ pageIndex: 0, pageSize: 10 });
      expect(deserializeDataTableState({ pageSize: 0 }).pagination).toEqual({
        pageIndex: 0,
        pageSize: 1,
      });
      expect(deserializeDataTableState({ pageSize: 200 }).pagination).toEqual({
        pageIndex: 0,
        pageSize: 100,
      });
    });

    it("should deserialize sorting", () => {
      const result = deserializeDataTableState({
        sortBy: "name",
        sortOrder: "desc",
      });
      expect(result.sorting).toEqual([{ id: "name", desc: true }]);
    });

    it("should default to ascending sort", () => {
      const result = deserializeDataTableState({ sortBy: "name" });
      expect(result.sorting).toEqual([{ id: "name", desc: false }]);
    });

    it("should validate sortBy format", () => {
      expect(
        deserializeDataTableState({ sortBy: "invalid$column" }).sorting
      ).toEqual([]);
      expect(
        deserializeDataTableState({ sortBy: "a".repeat(101) }).sorting
      ).toEqual([]);
    });

    it("should deserialize column filters", () => {
      const result = deserializeDataTableState({
        filter_status: "active",
        filter_type: "premium",
        other_param: "ignored",
      });
      expect(result.columnFilters).toEqual([
        { id: "status", value: "active" },
        { id: "type", value: "premium" },
      ]);
    });

    it("should skip invalid filter values", () => {
      const result = deserializeDataTableState({
        filter_empty: "",
        filter_null: null,
        filter_undefined: undefined,
        filter_valid: "test",
      });
      expect(result.columnFilters).toEqual([{ id: "valid", value: "test" }]);
    });

    it("should handle very long filter values", () => {
      const result = deserializeDataTableState({
        filter_long: "a".repeat(1001),
      });
      expect(result.columnFilters).toEqual([]);
    });

    it("should deserialize global filter", () => {
      const result = deserializeDataTableState({ search: "test search" });
      expect(result.globalFilter).toBe("test search");
    });

    it("should limit global filter length", () => {
      const result = deserializeDataTableState({ search: "a".repeat(1001) });
      expect(result.globalFilter).toBe("");
    });

    it("should deserialize column visibility", () => {
      const result = deserializeDataTableState({ columns: "name,age,status" });
      expect(result.columnVisibility).toEqual({
        name: true,
        age: true,
        status: true,
      });
    });

    it("should validate column names", () => {
      const result = deserializeDataTableState({
        columns: "valid,invalid$col,also-valid",
      });
      expect(result.columnVisibility).toEqual({
        valid: true,
        "also-valid": true,
      });
    });

    it("should handle empty columns", () => {
      const result = deserializeDataTableState({ columns: ",," });
      expect(result.columnVisibility).toEqual({});
    });

    it("should deserialize row selection", () => {
      const result = deserializeDataTableState({ selected: "row1,row2,row3" });
      expect(result.rowSelection).toEqual({
        row1: true,
        row2: true,
        row3: true,
      });
    });

    it("should validate row IDs", () => {
      const result = deserializeDataTableState({
        selected: "valid,invalid$id,also-valid",
      });
      expect(result.rowSelection).toEqual({
        valid: true,
        "also-valid": true,
      });
    });

    it("should handle empty params", () => {
      const result = deserializeDataTableState({});
      expect(result).toEqual({
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [],
        columnFilters: [],
        globalFilter: "",
        columnVisibility: {},
        rowSelection: {},
      });
    });

    it("should handle decimal page numbers", () => {
      const result = deserializeDataTableState({
        page: 2.7,
        pageSize: 15.9,
      });
      expect(result.pagination).toEqual({ pageIndex: 1, pageSize: 15 });
    });
  });

  describe("tableStateToSearchParams", () => {
    it("should convert table state to search params", () => {
      const result = tableStateToSearchParams({
        pagination: { pageIndex: 1, pageSize: 20 },
        sorting: [{ id: "name", desc: true }],
        columnFilters: [{ id: "status", value: "active" }],
        globalFilter: "search",
        columnVisibility: { name: true },
        rowSelection: { row1: true },
      });

      expect(result).toEqual({
        pagination: { pageIndex: 1, pageSize: 20 },
        sorting: [{ id: "name", desc: true }],
        columnFilters: [{ id: "status", value: "active" }],
        globalFilter: "search",
        columnVisibility: { name: true },
        rowSelection: { row1: true },
      });
    });

    it("should handle complex filter structures", () => {
      const result = tableStateToSearchParams({
        columnFilters: [
          {
            id: "age",
            value: { operator: "between", values: [20, 30] },
          },
        ],
      });

      expect(result.columnFilters).toEqual([{ id: "age", value: 20 }]);
    });

    it("should handle missing properties", () => {
      const result = tableStateToSearchParams({});
      expect(result).toEqual({
        pagination: undefined,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
        columnVisibility: {},
        rowSelection: {},
      });
    });

    it("should handle null values", () => {
      const result = tableStateToSearchParams({
        sorting: undefined,
        columnFilters: undefined,
        globalFilter: undefined,
        columnVisibility: undefined,
        rowSelection: undefined,
      });

      expect(result).toEqual({
        pagination: undefined,
        sorting: [],
        columnFilters: [],
        globalFilter: "",
        columnVisibility: {},
        rowSelection: {},
      });
    });
  });

  describe("searchParamsToTableState", () => {
    it("should convert search params to table state", () => {
      const params = {
        pagination: { pageIndex: 1, pageSize: 20 },
        sorting: [{ id: "name", desc: true }],
        columnFilters: [{ id: "status", value: "active" }],
        globalFilter: "search",
        columnVisibility: { name: true },
        rowSelection: { row1: true },
      };

      const result = searchParamsToTableState(params);
      expect(result).toEqual(params);
    });
  });

  describe("createMinimalSearchParams", () => {
    it("should create minimal params", () => {
      const result = createMinimalSearchParams({
        page: 2,
        pageSize: 20,
        search: "test",
        sortBy: "name",
        sortOrder: "desc",
      });

      expect(result).toEqual({
        page: 2,
        pageSize: 20,
        search: "test",
        sortBy: "name",
        sortOrder: "desc",
      });
    });

    it("should omit default values", () => {
      const result = createMinimalSearchParams({
        page: 1,
        pageSize: 10,
        search: "",
        sortBy: "",
        sortOrder: "asc",
      });

      expect(result).toEqual({});
    });

    it("should trim search and sortBy", () => {
      const result = createMinimalSearchParams({
        search: "  test  ",
        sortBy: "  name  ",
      });

      expect(result).toEqual({
        search: "  test  ",
        sortBy: "  name  ",
      });
    });

    it("should handle undefined values", () => {
      const result = createMinimalSearchParams({});
      expect(result).toEqual({});
    });
  });

  describe("createDebouncedUrlUpdate", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should debounce function calls", () => {
      const fn = vi.fn();
      const debounced = createDebouncedUrlUpdate(fn, 300);

      debounced("arg1");
      debounced("arg2");
      debounced("arg3");

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("arg3");
    });

    it("should use default delay", () => {
      const fn = vi.fn();
      const debounced = createDebouncedUrlUpdate(fn);

      debounced();
      vi.advanceTimersByTime(299);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple arguments", () => {
      const fn = vi.fn();
      const debounced = createDebouncedUrlUpdate(fn, 100);

      debounced("a", "b", "c");
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith("a", "b", "c");
    });

    it("should cancel previous timeout on new call", () => {
      const fn = vi.fn();
      const debounced = createDebouncedUrlUpdate(fn, 300);

      debounced("first");
      vi.advanceTimersByTime(200);
      debounced("second");
      vi.advanceTimersByTime(200);
      debounced("third");
      vi.advanceTimersByTime(300);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("third");
    });
  });
});
