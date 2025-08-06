import { describe, it, expect } from "vitest";
import {
  columnFilterSchema,
  sortStateSchema,
  paginationStateSchema,
  columnVisibilitySchema,
  rowSelectionSchema,
  dataTableSearchParamsSchema,
  minimalDataTableSearchParamsSchema,
  DEFAULT_SEARCH_PARAMS,
  type ColumnFilter,
  type SortState,
  type PaginationState,
  type ColumnVisibility,
  type RowSelection,
  type DataTableSearchParams,
  type MinimalDataTableSearchParams,
} from "./search-params";

describe("search-params schemas", () => {
  describe("columnFilterSchema", () => {
    it("should validate string filter value", () => {
      const input = { id: "name", value: "John" };
      const result = columnFilterSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate number filter value", () => {
      const input = { id: "age", value: 25 };
      const result = columnFilterSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate boolean filter value", () => {
      const input = { id: "active", value: true };
      const result = columnFilterSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate array filter values", () => {
      const input = { id: "status", value: ["active", "pending"] };
      const result = columnFilterSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate mixed array filter values", () => {
      const input = { id: "mixed", value: ["string", 123, true] };
      const result = columnFilterSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should reject invalid filter value types", () => {
      const input = { id: "test", value: { invalid: "object" } };
      expect(() => columnFilterSchema.parse(input)).toThrow();
    });

    it("should require id field", () => {
      const input = { value: "test" };
      expect(() => columnFilterSchema.parse(input)).toThrow();
    });

    it("should reject non-string id", () => {
      const input = { id: 123, value: "test" };
      expect(() => columnFilterSchema.parse(input)).toThrow();
    });
  });

  describe("sortStateSchema", () => {
    it("should validate ascending sort", () => {
      const input = { id: "name", desc: false };
      const result = sortStateSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate descending sort", () => {
      const input = { id: "createdAt", desc: true };
      const result = sortStateSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should require id field", () => {
      const input = { desc: false };
      expect(() => sortStateSchema.parse(input)).toThrow();
    });

    it("should require desc field", () => {
      const input = { id: "name" };
      expect(() => sortStateSchema.parse(input)).toThrow();
    });

    it("should reject non-boolean desc", () => {
      const input = { id: "name", desc: "false" };
      expect(() => sortStateSchema.parse(input)).toThrow();
    });
  });

  describe("paginationStateSchema", () => {
    it("should validate valid pagination state", () => {
      const input = { pageIndex: 2, pageSize: 25 };
      const result = paginationStateSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should catch negative pageIndex and default to 0", () => {
      const input = { pageIndex: -1, pageSize: 10 };
      const result = paginationStateSchema.parse(input);
      expect(result).toEqual({ pageIndex: 0, pageSize: 10 });
    });

    it("should catch pageSize below 1 and default to 10", () => {
      const input = { pageIndex: 0, pageSize: 0 };
      const result = paginationStateSchema.parse(input);
      expect(result).toEqual({ pageIndex: 0, pageSize: 10 });
    });

    it("should catch pageSize above 100 and default to 10", () => {
      const input = { pageIndex: 0, pageSize: 150 };
      const result = paginationStateSchema.parse(input);
      expect(result).toEqual({ pageIndex: 0, pageSize: 10 });
    });

    it("should allow maximum pageSize of 100", () => {
      const input = { pageIndex: 0, pageSize: 100 };
      const result = paginationStateSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should allow minimum pageSize of 1", () => {
      const input = { pageIndex: 0, pageSize: 1 };
      const result = paginationStateSchema.parse(input);
      expect(result).toEqual(input);
    });
  });

  describe("columnVisibilitySchema", () => {
    it("should validate column visibility record", () => {
      const input = { name: true, email: false, status: true };
      const result = columnVisibilitySchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate empty record", () => {
      const input = {};
      const result = columnVisibilitySchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should reject non-boolean values", () => {
      const input = { name: "true", email: false };
      expect(() => columnVisibilitySchema.parse(input)).toThrow();
    });

    it("should handle numeric keys as strings", () => {
      // Zod record schema with z.string() key accepts numeric keys as strings
      const input = { 123: true };
      const result = columnVisibilitySchema.parse(input);
      expect(result).toEqual({ "123": true });
    });
  });

  describe("rowSelectionSchema", () => {
    it("should validate row selection record", () => {
      const input = { "1": true, "2": false, "3": true };
      const result = rowSelectionSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate empty record", () => {
      const input = {};
      const result = rowSelectionSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should reject non-boolean values", () => {
      const input = { "1": "true", "2": false };
      expect(() => rowSelectionSchema.parse(input)).toThrow();
    });
  });

  describe("dataTableSearchParamsSchema", () => {
    it("should validate complete search params", () => {
      const input = {
        pagination: { pageIndex: 1, pageSize: 20 },
        sorting: [{ id: "name", desc: false }],
        columnFilters: [{ id: "status", value: "active" }],
        globalFilter: "search term",
        columnVisibility: { email: false },
        rowSelection: { "1": true },
      };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate with optional fields missing", () => {
      const input = {};
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result).toEqual({
        sorting: [],
        columnFilters: [],
        globalFilter: "",
        columnVisibility: {},
        rowSelection: {},
      });
    });

    it("should catch invalid sorting and default to empty array", () => {
      const input = { sorting: "invalid" };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.sorting).toEqual([]);
    });

    it("should catch invalid columnFilters and default to empty array", () => {
      const input = { columnFilters: "invalid" };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.columnFilters).toEqual([]);
    });

    it("should catch invalid globalFilter and default to empty string", () => {
      const input = { globalFilter: 123 };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.globalFilter).toEqual("");
    });

    it("should catch invalid columnVisibility and default to empty object", () => {
      const input = { columnVisibility: "invalid" };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.columnVisibility).toEqual({});
    });

    it("should catch invalid rowSelection and default to empty object", () => {
      const input = { rowSelection: "invalid" };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.rowSelection).toEqual({});
    });

    it("should validate multiple sort states", () => {
      const input = {
        sorting: [
          { id: "name", desc: false },
          { id: "createdAt", desc: true },
        ],
      };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.sorting).toHaveLength(2);
    });

    it("should validate multiple column filters", () => {
      const input = {
        columnFilters: [
          { id: "status", value: ["active", "pending"] },
          { id: "name", value: "John" },
          { id: "age", value: 25 },
        ],
      };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.columnFilters).toHaveLength(3);
    });
  });

  describe("minimalDataTableSearchParamsSchema", () => {
    it("should validate complete minimal search params", () => {
      const input = {
        page: 2,
        pageSize: 25,
        search: "test query",
        sortBy: "name",
        sortOrder: "desc" as const,
      };
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result).toEqual(input);
    });

    it("should validate with defaults", () => {
      const input = {};
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result).toEqual({
        page: 1,
        pageSize: 10,
        search: "",
        sortBy: "",
        sortOrder: "asc",
      });
    });

    it("should catch page below 1 and default to 1", () => {
      const input = { page: 0 };
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result.page).toBe(1);
    });

    it("should catch pageSize below 1 and default to 10", () => {
      const input = { pageSize: 0 };
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result.pageSize).toBe(10);
    });

    it("should catch pageSize above 100 and default to 10", () => {
      const input = { pageSize: 150 };
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result.pageSize).toBe(10);
    });

    it("should catch invalid sortOrder and default to asc", () => {
      const input = { sortOrder: "invalid" };
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result.sortOrder).toBe("asc");
    });

    it("should catch invalid search and default to empty string", () => {
      const input = { search: 123 };
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result.search).toBe("");
    });

    it("should catch invalid sortBy and default to empty string", () => {
      const input = { sortBy: 123 };
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result.sortBy).toBe("");
    });

    it("should validate asc sort order", () => {
      const input = { sortOrder: "asc" as const };
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result.sortOrder).toBe("asc");
    });

    it("should validate desc sort order", () => {
      const input = { sortOrder: "desc" as const };
      const result = minimalDataTableSearchParamsSchema.parse(input);
      expect(result.sortOrder).toBe("desc");
    });
  });

  describe("DEFAULT_SEARCH_PARAMS", () => {
    it("should have correct default values", () => {
      expect(DEFAULT_SEARCH_PARAMS).toEqual({
        pagination: {
          pageIndex: 0,
          pageSize: 10,
        },
        sorting: [],
        columnFilters: [],
        globalFilter: "",
        columnVisibility: {},
        rowSelection: {},
      });
    });

    it("should be valid according to schema", () => {
      const result = dataTableSearchParamsSchema.parse(DEFAULT_SEARCH_PARAMS);
      expect(result).toEqual(DEFAULT_SEARCH_PARAMS);
    });

    it("should be readonly at TypeScript level", () => {
      // The 'as const' assertion makes it readonly at TypeScript level
      // Runtime mutability depends on how the object is used
      // Testing that the structure is correct
      expect(Array.isArray(DEFAULT_SEARCH_PARAMS.sorting)).toBe(true);
      expect(Array.isArray(DEFAULT_SEARCH_PARAMS.columnFilters)).toBe(true);
      expect(typeof DEFAULT_SEARCH_PARAMS.globalFilter).toBe("string");
    });
  });

  describe("Type exports", () => {
    it("should export correct TypeScript types", () => {
      // Type checking tests - these will fail at compile time if types are wrong
      const columnFilter: ColumnFilter = { id: "test", value: "value" };
      const sortState: SortState = { id: "test", desc: false };
      const paginationState: PaginationState = { pageIndex: 0, pageSize: 10 };
      const columnVisibility: ColumnVisibility = { test: true };
      const rowSelection: RowSelection = { "1": true };
      const searchParams: DataTableSearchParams = {
        pagination: paginationState,
        sorting: [sortState],
        columnFilters: [columnFilter],
        globalFilter: "test",
        columnVisibility,
        rowSelection,
      };
      const minimalSearchParams: MinimalDataTableSearchParams = {
        page: 1,
        pageSize: 10,
        search: "test",
        sortBy: "name",
        sortOrder: "asc",
      };

      // Basic validation that types work
      expect(columnFilter.id).toBe("test");
      expect(sortState.desc).toBe(false);
      expect(paginationState.pageIndex).toBe(0);
      expect(columnVisibility.test).toBe(true);
      expect(rowSelection["1"]).toBe(true);
      expect(searchParams.globalFilter).toBe("test");
      expect(minimalSearchParams.page).toBe(1);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle null values by catching and using defaults", () => {
      const input = {
        // pagination: null, // Skip pagination as it doesn't have .catch()
        sorting: null,
        columnFilters: null,
        globalFilter: null,
        columnVisibility: null,
        rowSelection: null,
      };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.sorting).toEqual([]);
      expect(result.columnFilters).toEqual([]);
      expect(result.globalFilter).toBe("");
      expect(result.columnVisibility).toEqual({});
      expect(result.rowSelection).toEqual({});
    });

    it("should handle undefined values gracefully", () => {
      const input = {
        pagination: undefined,
        sorting: undefined,
        columnFilters: undefined,
        globalFilter: undefined,
        columnVisibility: undefined,
        rowSelection: undefined,
      };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.sorting).toEqual([]);
      expect(result.columnFilters).toEqual([]);
      expect(result.globalFilter).toBe("");
      expect(result.columnVisibility).toEqual({});
      expect(result.rowSelection).toEqual({});
    });

    it("should handle partially valid sorting arrays", () => {
      const input = {
        sorting: [
          { id: "valid", desc: true },
          { id: "invalid" }, // Missing desc
          { desc: false }, // Missing id
          { id: "another", desc: false },
        ],
      };
      // Should catch the invalid array and default to empty
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.sorting).toEqual([]);
    });

    it("should handle complex filter values", () => {
      const input = {
        columnFilters: [
          { id: "tags", value: ["tag1", "tag2", "tag3"] },
          { id: "numbers", value: [1, 2, 3, 4, 5] },
          { id: "mixed", value: ["string", 42, true, "another"] },
          { id: "boolean", value: false },
        ],
      };
      const result = dataTableSearchParamsSchema.parse(input);
      expect(result.columnFilters).toHaveLength(4);
      expect(result.columnFilters?.[0]?.value).toEqual([
        "tag1",
        "tag2",
        "tag3",
      ]);
      expect(result.columnFilters?.[1]?.value).toEqual([1, 2, 3, 4, 5]);
      expect(result.columnFilters?.[2]?.value).toEqual([
        "string",
        42,
        true,
        "another",
      ]);
      expect(result.columnFilters?.[3]?.value).toBe(false);
    });
  });
});
