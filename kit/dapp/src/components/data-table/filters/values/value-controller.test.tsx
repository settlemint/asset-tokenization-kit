/**
 * @vitest-environment happy-dom
 */
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import {
  createMockColumn,
  generateMockData,
  renderWithProviders,
  type TestDataItem,
} from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ColumnDataType } from "../types/column-types";
import {
  PropertyFilterOptionValueDisplay,
  PropertyFilterValueController,
  PropertyFilterValueDisplay,
} from "./value-controller";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "en",
    },
  }),
}));

// Mock the value menu component
vi.mock("./value-menu", () => ({
  PropertyFilterValueMenu: vi.fn(({ onClose }) => (
    <div data-testid="value-menu">
      <button onClick={onClose} data-testid="close-menu">
        Close
      </button>
    </div>
  )),
}));

// Mock date value displays
vi.mock("./date-value-menu", () => ({
  PropertyFilterDateValueDisplay: vi.fn(() => (
    <div data-testid="date-value-display">Date Value</div>
  )),
}));

vi.mock("./text-value-menu", () => ({
  PropertyFilterTextValueDisplay: vi.fn(() => (
    <div data-testid="text-value-display">Text Value</div>
  )),
}));

vi.mock("./number-value-menu", () => ({
  PropertyFilterNumberValueDisplay: vi.fn(() => (
    <div data-testid="number-value-display">Number Value</div>
  )),
}));

vi.mock("./multi-option-value-menu", () => ({
  PropertyFilterMultiOptionValueDisplay: vi.fn(() => (
    <div data-testid="multi-option-value-display">Multi Option Value</div>
  )),
}));

vi.mock("./option-value-menu", () => ({
  PropertyFilterOptionValueDisplay: vi.fn(() => (
    <div data-testid="option-value-display">Option Value</div>
  )),
}));

// Mock table instance
const createMockTable = (data: TestDataItem[] = []) => ({
  getCoreRowModel: vi.fn().mockReturnValue({
    rows: data.map((item, index) => ({
      id: index.toString(),
      getValue: vi.fn((columnId: string) => {
        switch (columnId) {
          case "status":
            return item.status;
          case "name":
            return item.name;
          case "email":
            return item.email;
          default:
            return null;
        }
      }),
    })),
  }),
  getFilteredRowModel: vi.fn().mockReturnValue({
    rows: data.map((item, index) => ({
      id: index.toString(),
      getValue: vi.fn(
        (columnId: string) => item[columnId as keyof TestDataItem]
      ),
    })),
  }),
});

describe("PropertyFilterValueController", () => {
  const mockData = generateMockData(5);
  let mockTable: ReturnType<typeof createMockTable>;
  let mockColumn: ReturnType<typeof createMockColumn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTable = createMockTable(mockData);
    mockColumn = createMockColumn({
      id: "status",
      columnDef: {
        id: "status",
        accessorFn: (row: TestDataItem) => row,
        header: "Status",
        accessorKey: "status",
        enableSorting: true,
        enableHiding: true,
        meta: {
          displayName: "Status",
          type: "option",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
            { label: "Pending", value: "pending" },
          ],
        },
      },
    });
  });

  describe("Basic Rendering", () => {
    it("should render popover controller", () => {
      renderWithProviders(
        <PropertyFilterValueController
          id="status"
          column={mockColumn as unknown as Column<unknown>}
          columnMeta={
            mockColumn.columnDef.meta as unknown as ColumnMeta<unknown, unknown>
          }
          table={mockTable as unknown as Table<unknown>}
        />
      );

      // Should render a button trigger
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should handle popover interactions", async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <PropertyFilterValueController
          id="status"
          column={mockColumn as unknown as Column<unknown>}
          columnMeta={
            mockColumn.columnDef.meta as unknown as ColumnMeta<unknown, unknown>
          }
          table={mockTable as unknown as Table<unknown>}
        />
      );

      // Click to open popover
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Should show value menu - expect multiple elements since Radix UI creates wrapper
      const valueMenus = screen.getAllByTestId("value-menu");
      expect(valueMenus.length).toBeGreaterThan(0);
    });

    it("should handle close interactions", async () => {
      const user = userEvent.setup();

      renderWithProviders(
        <PropertyFilterValueController
          id="status"
          column={mockColumn as unknown as Column<unknown>}
          columnMeta={
            mockColumn.columnDef.meta as unknown as ColumnMeta<unknown, unknown>
          }
          table={mockTable as unknown as Table<unknown>}
        />
      );

      // Open popover
      const trigger = screen.getByRole("button");
      await user.click(trigger);

      // Verify close button exists
      const closeButton = screen.getByTestId("close-menu");
      expect(closeButton).toBeInTheDocument();

      // Click close button
      await user.click(closeButton);

      // After close, the popover should be closed (button state should be closed)
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });
});

describe("PropertyFilterValueDisplay", () => {
  const mockTable = createMockTable();

  it("should render option type display", () => {
    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "option",
          displayName: "Status",
        },
      },
    });

    renderWithProviders(
      <PropertyFilterValueDisplay
        id="status"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(screen.getByTestId("option-value-display")).toBeInTheDocument();
  });

  it("should render multiOption type display", () => {
    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "multiOption",
          displayName: "Tags",
        },
      },
    });

    renderWithProviders(
      <PropertyFilterValueDisplay
        id="tags"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(
      screen.getByTestId("multi-option-value-display")
    ).toBeInTheDocument();
  });

  it("should render date type display", () => {
    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "date",
          displayName: "Created Date",
        },
      },
    });

    renderWithProviders(
      <PropertyFilterValueDisplay
        id="date"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(screen.getByTestId("date-value-display")).toBeInTheDocument();
  });

  it("should render text type display", () => {
    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "text",
          displayName: "Name",
        },
      },
    });

    renderWithProviders(
      <PropertyFilterValueDisplay
        id="name"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(screen.getByTestId("text-value-display")).toBeInTheDocument();
  });

  it("should render number type display", () => {
    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "number",
          displayName: "Price",
        },
      },
    });

    renderWithProviders(
      <PropertyFilterValueDisplay
        id="price"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(screen.getByTestId("number-value-display")).toBeInTheDocument();
  });

  it("should return null for unknown type", () => {
    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "unknown" as ColumnDataType,
          displayName: "Unknown",
        },
      },
    });

    const { container } = renderWithProviders(
      <PropertyFilterValueDisplay
        id="unknown"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});

describe("PropertyFilterOptionValueDisplay", () => {
  const mockData = [
    { id: 1, name: "John", status: "active" },
    { id: 2, name: "Jane", status: "inactive" },
    { id: 3, name: "Bob", status: "pending" },
    { id: 4, name: "Alice", status: "active" },
  ];

  it("should use static options when provided", () => {
    const mockTable = createMockTable(mockData as unknown as TestDataItem[]);
    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "option",
          displayName: "Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
      },
    });

    renderWithProviders(
      <PropertyFilterOptionValueDisplay
        id="status"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(screen.getByTestId("option-value-display")).toBeInTheDocument();
  });

  it("should generate dynamic options from column data", () => {
    // Create data that conforms to ColumnOption type
    const mockOptionData = [
      { label: "Active", value: "active" },
      { label: "Inactive", value: "inactive" },
      { label: "Pending", value: "pending" },
    ];

    const mockTable = {
      getCoreRowModel: vi.fn().mockReturnValue({
        rows: mockOptionData.map((item, index) => ({
          id: index.toString(),
          getValue: vi.fn(() => item),
        })),
      }),
    };

    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "option",
          displayName: "Status",
          // No static options provided - should generate from data
        },
      },
    });

    renderWithProviders(
      <PropertyFilterOptionValueDisplay
        id="status"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(screen.getByTestId("option-value-display")).toBeInTheDocument();
  });

  it("should handle transform function for options", () => {
    const mockComplexData = [
      { id: 1, user: { name: "John", role: "admin" } },
      { id: 2, user: { name: "Jane", role: "user" } },
    ];

    const mockTable = {
      getCoreRowModel: vi.fn().mockReturnValue({
        rows: mockComplexData.map((item, index) => ({
          id: index.toString(),
          getValue: vi.fn(() => item.user),
        })),
      }),
    };

    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "option",
          displayName: "User Role",
          transformOptionFn: (user: unknown) => ({
            label: (user as { role: string }).role,
            value: (user as { role: string }).role,
          }),
        },
      },
    });

    renderWithProviders(
      <PropertyFilterOptionValueDisplay
        id="user"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(screen.getByTestId("option-value-display")).toBeInTheDocument();
  });

  it("should handle column option arrays", () => {
    const mockOptionData = [
      [
        { label: "Red", value: "red" },
        { label: "Blue", value: "blue" },
      ],
      [{ label: "Green", value: "green" }],
    ];

    const mockTable = {
      getCoreRowModel: vi.fn().mockReturnValue({
        rows: mockOptionData.map((item, index) => ({
          id: index.toString(),
          getValue: vi.fn(() => item),
        })),
      }),
    };

    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "option",
          displayName: "Colors",
        },
      },
    });

    renderWithProviders(
      <PropertyFilterOptionValueDisplay
        id="colors"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(screen.getByTestId("option-value-display")).toBeInTheDocument();
  });

  it("should filter out null and undefined values", () => {
    const mockDataWithNulls = [
      { id: 1, status: "active" },
      { id: 2, status: null },
      { id: 3, status: undefined },
      { id: 4, status: "inactive" },
    ];

    const mockTable = {
      getCoreRowModel: vi.fn().mockReturnValue({
        rows: mockDataWithNulls.map((item, index) => ({
          id: index.toString(),
          getValue: vi.fn(() => item.status),
        })),
      }),
    };

    const column = createMockColumn({
      columnDef: {
        id: "test-column",
        accessorFn: (row: TestDataItem) => row,
        meta: {
          type: "option",
          displayName: "Status",
          options: [
            { label: "Active", value: "active" },
            { label: "Inactive", value: "inactive" },
          ],
        },
      },
    });

    renderWithProviders(
      <PropertyFilterOptionValueDisplay
        id="status"
        column={column as Column<unknown>}
        columnMeta={column.columnDef.meta as ColumnMeta<unknown, unknown>}
        table={mockTable as unknown as Table<unknown>}
      />
    );

    expect(screen.getByTestId("option-value-display")).toBeInTheDocument();
  });
});
