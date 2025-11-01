import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  type Column,
  type ColumnDef,
  type Header,
  type Row,
  type RowModel,
  type Table,
  type TableState,
} from "@tanstack/react-table";
import { render, type RenderOptions } from "@testing-library/react";
import { type ComponentType, type ReactElement, type ReactNode } from "react";
import { vi, type Mock } from "vitest";
import type { BulkAction } from "../../src/components/data-table/types/bulk-actions";

// Make vi globally available for module-level mocking in test files
if (typeof globalThis !== "undefined") {
  (globalThis as typeof globalThis & { vi: typeof vi }).vi = vi;
}

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      // For testing, just return the key for most cases
      // But handle specific cases that tests expect
      if (key === "selectedRowsInfo" && params) {
        return `${params.selected} of ${params.total} row(s) selected`;
      }
      if (key === "bulkActions.selectedCount" && params?.count !== undefined) {
        const countStr =
          typeof params.count === "object" && params.count !== null
            ? JSON.stringify(params.count)
            : (params.count as string);
        return `${countStr} selected`;
      }
      if (key === "bulkActions.selectRow" && params?.row !== undefined) {
        const rowStr =
          typeof params.row === "object" && params.row !== null
            ? JSON.stringify(params.row)
            : (params.row as string | number).toString();
        return `Select row ${rowStr}`;
      }
      return key;
    },
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "en",
    },
  }),
  Trans: ({ children }: { children: ReactNode }) => children,
  I18nextProvider: ({ children }: { children: ReactNode }) => children,
  // Add withTranslation in case it's used somewhere
  withTranslation: () => (Component: ComponentType) => Component,
  // Mock initReactI18next
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}));

// Mock data types for testing
export interface TestDataItem {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "pending";
  role: "admin" | "user" | "viewer";
  createdAt: Date;
  age?: number;
  department?: string;
  tags?: string[];
}

// Generate mock data
export const generateMockData = (count: number = 10): TestDataItem[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${i + 1}`,
    name: `User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    status: ["active", "inactive", "pending"][i % 3] as TestDataItem["status"],
    role: ["admin", "user", "viewer"][i % 3] as TestDataItem["role"],
    createdAt: new Date(2024, 0, i + 1),
    age: 20 + (i % 40),
    department: ["Engineering", "Sales", "Marketing"][i % 3],
    tags: i % 2 === 0 ? ["tag1", "tag2"] : ["tag3"],
  }));
};

// Default columns for testing
export const defaultColumns: ColumnDef<TestDataItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={(e) => {
          table.toggleAllRowsSelected(e.target.checked);
        }}
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={(e) => {
          row.toggleSelected(e.target.checked);
        }}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    enableHiding: true,
    meta: {
      variant: "default",
      type: "text",
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    enableSorting: true,
    enableHiding: true,
    meta: {
      variant: "default",
      type: "text",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    meta: {
      variant: "default",
      type: "option",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ],
    },
  },
  {
    accessorKey: "role",
    header: "Role",
    enableSorting: true,
    enableHiding: true,
    meta: {
      variant: "default",
      type: "option",
      options: [
        { label: "Admin", value: "admin" },
        { label: "User", value: "user" },
        { label: "Viewer", value: "viewer" },
      ],
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    enableSorting: true,
    cell: ({ row }) => {
      const date = row.getValue("createdAt");
      return date && date instanceof Date
        ? date.toLocaleDateString()
        : "Invalid Date";
    },
  },
];

// Custom render function with providers
interface WrapperProps {
  children: ReactNode;
}

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: WrapperProps) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { wrapper: createWrapper(), ...options });
}

// Mock icons for testing
export const mockIcons = {
  ChevronDown: ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon-chevron-down">
      ChevronDown
    </span>
  ),
  ChevronUp: ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon-chevron-up">
      ChevronUp
    </span>
  ),
  Search: ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon-search">
      Search
    </span>
  ),
  X: ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon-x">
      X
    </span>
  ),
  Filter: ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon-filter">
      Filter
    </span>
  ),
  Download: ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon-download">
      Download
    </span>
  ),
  Settings: ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon-settings">
      Settings
    </span>
  ),
  MoreHorizontal: ({ className }: { className?: string }) => (
    <span className={className} data-testid="icon-more">
      More
    </span>
  ),
} as Record<string, ComponentType<{ className?: string }>>;

// Mock router
export const mockRouter = {
  navigate: vi.fn(),
  params: {},
  searchParams: new URLSearchParams(),
  pathname: "/test",
};

// Mock location
export const mockLocation = {
  pathname: "/test",
  search: "",
  hash: "",
  state: null,
};

// Helper to override specific state values while maintaining the complete TableState
export function overrideTableState<TData = unknown>(
  mockTable: Table<TData>,
  stateOverrides: Partial<ReturnType<Table<TData>["getState"]>>
) {
  const getStateMock = mockTable.getState as Mock<() => TableState>;
  const defaultState = getStateMock.mock.results[0]?.value || getStateMock();
  getStateMock.mockReturnValue({
    ...defaultState,
    ...stateOverrides,
  });
}

// Create mock table instance with proper typing
export function createMockTable<TData = unknown>(
  overrides: Partial<Table<TData>> = {}
): Table<TData> {
  const mockTable = {
    getState: vi.fn(() => ({
      sorting: [],
      columnFilters: [],
      globalFilter: "",
      pagination: { pageIndex: 0, pageSize: 10 },
      columnVisibility: {},
      rowSelection: {},
      columnOrder: [],
      columnPinning: { left: [], right: [] },
      rowPinning: { top: [], bottom: [] },
      expanded: {},
      grouping: [],
      columnSizing: {},
      columnSizingInfo: {
        startOffset: null,
        startSize: null,
        deltaOffset: null,
        deltaPercentage: null,
        isResizingColumn: false,
        columnSizingStart: [],
      },
    })),
    getAllColumns: vi.fn().mockReturnValue([
      { id: "id", getCanHide: vi.fn().mockReturnValue(false) },
      { id: "name", getCanHide: vi.fn().mockReturnValue(true) },
      { id: "email", getCanHide: vi.fn().mockReturnValue(true) },
    ]),
    getIsAllColumnsVisible: vi.fn().mockReturnValue(false),
    toggleAllColumnsVisible: vi.fn(),
    setColumnVisibility: vi.fn(),
    getFilteredSelectedRowModel: vi.fn().mockReturnValue({ rows: [] }),
    getFilteredRowModel: vi.fn().mockReturnValue({ rows: [] }),
    getSelectedRowModel: vi.fn().mockReturnValue({ rows: [] }),
    toggleAllRowsSelected: vi.fn(),
    toggleAllPageRowsSelected: vi.fn(),
    getIsAllRowsSelected: vi.fn().mockReturnValue(false),
    getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
    getIsSomeRowsSelected: vi.fn().mockReturnValue(false),
    getIsSomePageRowsSelected: vi.fn().mockReturnValue(false),
    getColumn: vi.fn((id: string) => ({
      id,
      getFilterValue: vi.fn(),
      setFilterValue: vi.fn(),
      getFacetedUniqueValues: vi.fn().mockReturnValue(new Map()),
      getCanSort: vi.fn().mockReturnValue(true),
      getIsSorted: vi.fn().mockReturnValue(false),
      toggleSorting: vi.fn(),
      clearSorting: vi.fn(),
      getCanHide: vi.fn().mockReturnValue(true),
      getIsVisible: vi.fn().mockReturnValue(true),
      toggleVisibility: vi.fn(),
    })),
    getPageCount: vi.fn().mockReturnValue(5),
    getCanPreviousPage: vi.fn().mockReturnValue(false),
    getCanNextPage: vi.fn().mockReturnValue(true),
    previousPage: vi.fn(),
    nextPage: vi.fn(),
    setPageIndex: vi.fn(),
    setPageSize: vi.fn(),
    getRowModel: vi.fn(
      () => ({ rows: [], flatRows: [], rowsById: {} }) as RowModel<TData>
    ),
    // eslint-disable-next-line no-unused-vars
    getRow: vi.fn((_id: string) => undefined as Row<TData> | undefined),
    getCenterRows: vi.fn(() => [] as Row<TData>[]),
    getTopRows: vi.fn(() => [] as Row<TData>[]),
    getBottomRows: vi.fn(() => [] as Row<TData>[]),
    getFlatHeaders: vi.fn(() => []),
    getHeaderGroups: vi.fn(() => []),
    getLeafHeaders: vi.fn(() => []),
    getCenterHeaderGroups: vi.fn(() => []),
    getCenterLeafHeaders: vi.fn(() => []),
    getLeftHeaderGroups: vi.fn(() => []),
    getLeftLeafHeaders: vi.fn(() => []),
    getRightHeaderGroups: vi.fn(() => []),
    getRightLeafHeaders: vi.fn(() => []),
    getFooterGroups: vi.fn(() => []),
    getCenterFooterGroups: vi.fn(() => []),
    getLeftFooterGroups: vi.fn(() => []),
    getRightFooterGroups: vi.fn(() => []),
    getTotalSize: vi.fn(() => 0),
    getLeftTotalSize: vi.fn(() => 0),
    getCenterTotalSize: vi.fn(() => 0),
    getRightTotalSize: vi.fn(() => 0),
    setGlobalFilter: vi.fn(),
    resetGlobalFilter: vi.fn(),
    setColumnFilters: vi.fn(),
    resetColumnFilters: vi.fn(),
    setSorting: vi.fn(),
    resetSorting: vi.fn(),
    setGrouping: vi.fn(),
    resetGrouping: vi.fn(),
    setExpanded: vi.fn(),
    resetExpanded: vi.fn(),
    setColumnOrder: vi.fn(),
    resetColumnOrder: vi.fn(),
    setColumnPinning: vi.fn(),
    resetColumnPinning: vi.fn(),
    setColumnSizing: vi.fn(),
    resetColumnSizing: vi.fn(),
    setColumnSizingInfo: vi.fn(),
    resetColumnSizingInfo: vi.fn(),
    setRowSelection: vi.fn(),
    resetRowSelection: vi.fn(),
    setPagination: vi.fn(),
    resetPagination: vi.fn(),
    resetPageIndex: vi.fn(),
    resetPageSize: vi.fn(),
    getPageOptions: vi.fn(() => []),
    getCanExpandRow: vi.fn(() => false),
    getExpandedDepth: vi.fn(() => 0),
    getPreExpandedRowModel: vi.fn(
      () => ({ rows: [], flatRows: [], rowsById: {} }) as RowModel<TData>
    ),
    getCoreRowModel: vi.fn(
      () => ({ rows: [], flatRows: [], rowsById: {} }) as RowModel<TData>
    ),
    getPrePaginationRowModel: vi.fn(
      () => ({ rows: [], flatRows: [], rowsById: {} }) as RowModel<TData>
    ),
    getPaginationRowModel: vi.fn(
      () => ({ rows: [], flatRows: [], rowsById: {} }) as RowModel<TData>
    ),
    getExpandedRowModel: vi.fn(
      () => ({ rows: [], flatRows: [], rowsById: {} }) as RowModel<TData>
    ),
    getGroupedRowModel: vi.fn(
      () => ({ rows: [], flatRows: [], rowsById: {} }) as RowModel<TData>
    ),
    getSortedRowModel: vi.fn(
      () => ({ rows: [], flatRows: [], rowsById: {} }) as RowModel<TData>
    ),
    getIsAllRowsExpanded: vi.fn(() => false),
    getIsSomeRowsExpanded: vi.fn(() => false),
    getToggleAllRowsExpandedHandler: vi.fn(() => vi.fn()),
    getIsSomeColumnsVisible: vi.fn(() => true),
    getToggleAllColumnsVisibilityHandler: vi.fn(() => vi.fn()),
    getIsSomeColumnsPinned: vi.fn(() => false),
    getLeftVisibleLeafColumns: vi.fn(() => []),
    getRightVisibleLeafColumns: vi.fn(() => []),
    getCenterVisibleLeafColumns: vi.fn(() => []),
    getVisibleFlatColumns: vi.fn(() => []),
    getVisibleLeafColumns: vi.fn(() => []),
    getAllFlatColumns: vi.fn(() => []),
    getAllLeafColumns: vi.fn(() => []),
    getColumnCanGlobalFilter: vi.fn(() => true),
    setOptions: vi.fn(),
    options: {
      meta: { name: "test-table" },
      data: [],
      columns: [],
      getCoreRowModel: vi.fn(),
      onStateChange: vi.fn(),
      renderFallbackValue: null,
      state: {},
    } as Record<string, unknown>,
    initialState: {} as Record<string, unknown>,
    ...overrides,
  } as Table<TData>;

  return mockTable;
}

// Create mock column that satisfies TanStack Table Column interface
export const createMockColumn = (
  overrides: Partial<Column<TestDataItem>> = {}
): Column<TestDataItem> => {
  const column = {
    id: overrides.id || "test",
    depth: 0,
    accessorFn: undefined,
    columnDef: overrides.columnDef || {
      id: "test",
      header: "Test",
      accessorKey: "test",
      enableSorting: true,
      enableHiding: true,
      meta: {
        displayName: "Test",
      },
    },
    columns: [],
    parent: undefined,
    getFlatColumns: vi.fn().mockReturnValue([]),
    getLeafColumns: vi.fn().mockReturnValue([]),

    // Sorting
    getCanSort: vi.fn().mockReturnValue(true),
    getIsSorted: vi.fn().mockReturnValue(false),
    toggleSorting: vi.fn(),
    getToggleSortingHandler: vi.fn().mockReturnValue(vi.fn()),
    clearSorting: vi.fn(),
    getAutoSortingFn: vi.fn(),
    getAutoSortDir: vi.fn().mockReturnValue("asc"),
    getSortingFn: vi.fn(),
    getFirstSortDir: vi.fn().mockReturnValue("asc"),
    getNextSortingOrder: vi.fn().mockReturnValue("asc"),
    getSortIndex: vi.fn().mockReturnValue(-1),

    // Visibility
    getCanHide: vi.fn().mockReturnValue(true),
    getIsVisible: vi.fn().mockReturnValue(true),
    toggleVisibility: vi.fn(),
    getToggleVisibilityHandler: vi.fn().mockReturnValue(vi.fn()),

    // Filtering
    getCanFilter: vi.fn().mockReturnValue(true),
    getIsFiltered: vi.fn().mockReturnValue(false),
    getFilterValue: vi.fn(),
    setFilterValue: vi.fn(),
    getAutoFilterFn: vi.fn(),
    getFilterFn: vi.fn(),

    // Faceting
    getFacetedRowModel: vi.fn(),
    getFacetedUniqueValues: vi.fn().mockReturnValue(new Map()),
    getFacetedMinMaxValues: vi.fn().mockReturnValue(undefined),

    // Grouping
    getCanGroup: vi.fn().mockReturnValue(false),
    getIsGrouped: vi.fn().mockReturnValue(false),
    getGroupedIndex: vi.fn().mockReturnValue(-1),
    toggleGrouping: vi.fn(),
    getToggleGroupingHandler: vi.fn().mockReturnValue(vi.fn()),
    getAutoAggregationFn: vi.fn(),
    getAggregationFn: vi.fn(),

    // Pinning
    getCanPin: vi.fn().mockReturnValue(true),
    getIsPinned: vi.fn().mockReturnValue(false),
    getPinnedIndex: vi.fn().mockReturnValue(-1),
    pin: vi.fn(),

    // Resizing
    getCanResize: vi.fn().mockReturnValue(true),
    getIsResizing: vi.fn().mockReturnValue(false),
    getSize: vi.fn().mockReturnValue(150),
    getStart: vi.fn().mockReturnValue(0),
    resetSize: vi.fn(),

    // Other
    getContext: vi.fn().mockReturnValue({
      table: createMockTable(),
      header: {} as Header<TestDataItem, unknown>,
      column: {} as Column<TestDataItem>,
    }),

    ...overrides,
  } as Column<TestDataItem>;

  return column;
};

// Test utilities for async operations
export const waitForLoadingToFinish = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

// Mock filter options
export const mockFilterOptions = [
  { label: "Active", value: "active", icon: mockIcons.ChevronUp },
  { label: "Inactive", value: "inactive", icon: mockIcons.ChevronDown },
  { label: "Pending", value: "pending", icon: mockIcons.Settings },
];

// Mock bulk actions
export const mockBulkActions: BulkAction<TestDataItem>[] = [
  {
    id: "delete",
    label: "Delete",
    variant: "destructive",
    requiresConfirmation: true,
    confirmationTitle: "Delete items",
    confirmationDescription: "Are you sure?",
    execute: vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }),
  },
  {
    id: "archive",
    label: "Archive",
    execute: vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }),
  },
];

// Mock action groups
export const mockActionGroups = [
  {
    id: "actions",
    label: "Actions",
    actions: mockBulkActions,
  },
];
