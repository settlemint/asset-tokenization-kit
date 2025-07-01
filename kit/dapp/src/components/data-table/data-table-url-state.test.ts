/**
 * DataTable URL State Tests
 *
 * Tests for the URL state management functionality in DataTable component.
 * These tests verify serialization, deserialization, and state synchronization.
 */

import { test, expect } from "bun:test";
import {
  serializeDataTableState,
  deserializeDataTableState,
  tableStateToSearchParams,
  searchParamsToTableState,
} from "./utils/search-param-serializers";
import type { DataTableSearchParams } from "./utils/search-params";

test("serializes table state to URL parameters", () => {
  const state: DataTableSearchParams = {
    pagination: { pageIndex: 2, pageSize: 20 },
    sorting: [{ id: "name", desc: false }],
    columnFilters: [{ id: "status", value: "active" }],
    globalFilter: "test search",
    columnVisibility: { email: false },
    rowSelection: { "1": true, "2": true },
  };

  const result = serializeDataTableState(state);

  expect(result.page).toBe(3); // 0-based to 1-based conversion
  expect(result.pageSize).toBe(20);
  expect(result.search).toBe("test search");
  expect(typeof result.sorting).toBe("string");
  expect(typeof result.filters).toBe("string");
  expect(typeof result.columns).toBe("string");
  expect(typeof result.selected).toBe("string");
});

test("deserializes URL parameters to table state", () => {
  const searchParams = {
    page: 2,
    pageSize: 15,
    search: "john",
    sorting: JSON.stringify([{ id: "createdAt", desc: true }]),
    filters: JSON.stringify([{ id: "role", value: "admin" }]),
    columns: JSON.stringify({ id: false }),
    selected: JSON.stringify({ "3": true }),
  };

  const result = deserializeDataTableState(searchParams);

  expect(result.pagination?.pageIndex).toBe(1); // 1-based to 0-based conversion
  expect(result.pagination?.pageSize).toBe(15);
  expect(result.globalFilter).toBe("john");
  expect(result.sorting).toEqual([{ id: "createdAt", desc: true }]);
  expect(result.columnFilters).toEqual([{ id: "role", value: "admin" }]);
  expect(result.columnVisibility).toEqual({ id: false });
  expect(result.rowSelection).toEqual({ "3": true });
});

test("handles empty and default values correctly", () => {
  // Empty state should produce minimal URL params
  const emptyState: DataTableSearchParams = {
    pagination: { pageIndex: 0, pageSize: 10 },
    sorting: [],
    columnFilters: [],
    globalFilter: "",
    columnVisibility: {},
    rowSelection: {},
  };

  const serialized = serializeDataTableState(emptyState);

  // Should only include non-default values
  expect(serialized.page).toBeUndefined(); // pageIndex 0 is default
  expect(serialized.pageSize).toBeUndefined(); // pageSize 10 is default
  expect(serialized.search).toBeUndefined(); // empty string
  expect(serialized.sorting).toBeUndefined(); // empty array
  expect(serialized.filters).toBeUndefined(); // empty array
  expect(serialized.columns).toBeUndefined(); // empty object
  expect(serialized.selected).toBeUndefined(); // empty object
});

test("handles malformed URL parameters gracefully", () => {
  const malformedParams = {
    page: "invalid",
    pageSize: -5,
    sorting: "invalid json",
    filters: "also invalid",
    columns: "{invalid}",
    selected: null,
  };

  const result = deserializeDataTableState(malformedParams);

  // Should fallback to defaults
  expect(result.pagination?.pageIndex).toBe(0);
  expect(result.pagination?.pageSize).toBe(1); // -5 clamped to 1
  expect(result.sorting).toEqual([]);
  expect(result.columnFilters).toEqual([]);
  expect(result.columnVisibility).toEqual({});
  expect(result.rowSelection).toEqual({});
});

test("converts between TanStack Table state and search params", () => {
  const tableState = {
    pagination: { pageIndex: 1, pageSize: 25 },
    sorting: [{ id: "name", desc: true }],
    columnFilters: [{ id: "status", value: "inactive" }],
    globalFilter: "search term",
    columnVisibility: { internal: false },
    rowSelection: { "5": true },
  };

  // Convert to search params format
  const searchParams = tableStateToSearchParams(tableState);

  expect(searchParams.pagination?.pageIndex).toBe(1);
  expect(searchParams.pagination?.pageSize).toBe(25);
  expect(searchParams.sorting).toEqual([{ id: "name", desc: true }]);

  // Convert back to table state format
  const backToTableState = searchParamsToTableState({
    ...searchParams,
    sorting: searchParams.sorting ?? [],
    columnFilters: searchParams.columnFilters ?? [],
    globalFilter: searchParams.globalFilter ?? "",
    columnVisibility: searchParams.columnVisibility ?? {},
    rowSelection: searchParams.rowSelection ?? {},
  });

  expect(backToTableState.pagination?.pageIndex).toBe(1);
  expect(backToTableState.pagination?.pageSize).toBe(25);
  expect(backToTableState.sorting).toEqual([{ id: "name", desc: true }]);
  expect(backToTableState.columnFilters).toEqual([
    { id: "status", value: "inactive" },
  ]);
  expect(backToTableState.globalFilter).toBe("search term");
});

test("handles page bounds correctly", () => {
  // Test page size bounds
  const stateWithLargePageSize = deserializeDataTableState({
    pageSize: 200, // Above max
  });
  expect(stateWithLargePageSize.pagination?.pageSize).toBe(100); // Clamped to max

  const stateWithSmallPageSize = deserializeDataTableState({
    pageSize: 0, // Below min
  });
  expect(stateWithSmallPageSize.pagination?.pageSize).toBe(1); // Clamped to min

  // Test negative page index
  const stateWithNegativePage = deserializeDataTableState({
    page: -1,
  });
  expect(stateWithNegativePage.pagination?.pageIndex).toBe(0); // Clamped to 0
});
