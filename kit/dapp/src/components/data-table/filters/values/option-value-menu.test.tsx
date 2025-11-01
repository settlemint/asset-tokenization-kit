/**
 * @vitest-environment happy-dom
 */
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "@test/helpers/test-utils";
import type { FilterValue } from "../types/filter-types";
import { PropertyFilterOptionValueMenu } from "./option-value-menu";
// import type { ColumnOption } from "../types/column-types";

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

// Mock lucide-react
vi.mock("lucide-react", () => ({
  CheckIcon: () => <div data-testid="check-icon">✓</div>,
  ChevronLeft: () => <div data-testid="chevron-left-icon">←</div>,
  Circle: () => <div data-testid="circle-icon">○</div>,
  CircleCheck: () => <div data-testid="circle-check-icon">✓</div>,
  SearchIcon: () => <div data-testid="search-icon">🔍</div>,
}));

// Mock the OptionItem component for easier testing
vi.mock("./option-item", () => ({
  OptionItem: ({
    option,
    checked,
    count,
    onSelect,
  }: {
    option: { value: string; label: string };
    checked: boolean;
    count?: number;
    onSelect: (value: string, selected: boolean) => void;
  }) => (
    <div
      data-testid={`option-item-${option.value}`}
      data-checked={checked}
      data-count={count}
      onClick={() => {
        onSelect(option.value, !checked);
      }}
    >
      {option.label} ({count})
    </div>
  ),
}));

// Helper to create mock column
function createMockColumn<TData>({
  filterValue,
  meta,
}: {
  filterValue?: FilterValue<"option", TData>;
  meta?: ColumnMeta<TData, unknown>;
}) {
  const setFilterValue = vi.fn();
  const getFilterValue = vi.fn().mockReturnValue(filterValue);

  return {
    getFilterValue,
    setFilterValue,
    columnDef: {
      meta,
    },
  } as unknown as Column<TData>;
}

// Helper to create mock table with data
function createMockTable<TData>(
  rows: Array<{ getValue: (id: string) => unknown }>
) {
  return {
    getCoreRowModel: () => ({
      rows,
    }),
  } as unknown as Table<TData>;
}

describe("PropertyFilterOptionValueMenu", () => {
  const user = userEvent.setup();
  const mockOnClose = vi.fn();
  const mockOnBack = vi.fn();
  const TestIcon = () => <div data-testid="test-icon">🎯</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with static options", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        displayName: "Status",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
      expect(screen.getByTestId("option-item-active")).toBeInTheDocument();
      expect(screen.getByTestId("option-item-inactive")).toBeInTheDocument();
    });

    it("should render with icon when provided", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        displayName: "Status",
        icon: TestIcon,
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("should render back button when onBack is provided", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId("chevron-left-icon")).toBeInTheDocument();
    });

    it("should use 'Filter' as default display name", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByText("Filter")).toBeInTheDocument();
    });
  });

  describe("Option Generation", () => {
    it("should use static options when provided", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [
          { value: "opt1", label: "Option 1" },
          { value: "opt2", label: "Option 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "different" },
        { getValue: () => "values" },
      ];

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      // Should show static options, not dynamic ones
      expect(screen.getByTestId("option-item-opt1")).toBeInTheDocument();
      expect(screen.getByTestId("option-item-opt2")).toBeInTheDocument();
      expect(
        screen.queryByTestId("option-item-different")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("option-item-values")
      ).not.toBeInTheDocument();
    });

    it("should generate options using transformOptionFn", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        transformOptionFn: (value: number) => ({
          value: String(value),
          label: `Number ${value}`,
        }),
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => 1 },
        { getValue: () => 2 },
        { getValue: () => 1 }, // Duplicate
        { getValue: () => 3 },
      ];

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="number"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      // Should show unique transformed options
      expect(screen.getByTestId("option-item-1")).toBeInTheDocument();
      expect(screen.getByText("Number 1 (2)")).toBeInTheDocument(); // Count is 2
      expect(screen.getByTestId("option-item-2")).toBeInTheDocument();
      expect(screen.getByText("Number 2 (1)")).toBeInTheDocument();
      expect(screen.getByTestId("option-item-3")).toBeInTheDocument();
      expect(screen.getByText("Number 3 (1)")).toBeInTheDocument();
    });

    it("should use column data directly when it conforms to ColumnOption", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => ({ value: "a", label: "A" }) },
        { getValue: () => ({ value: "b", label: "B" }) },
        { getValue: () => ({ value: "a", label: "A" }) }, // Duplicate
      ];

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="option"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      // Objects are now properly deduplicated by value property
      expect(screen.getByTestId("option-item-a")).toBeInTheDocument();
      expect(screen.getByTestId("option-item-b")).toBeInTheDocument();
      // Options show correct counts based on actual data occurrences
      expect(screen.getByText("A (2)")).toBeInTheDocument(); // Two occurrences of "a" in data
      expect(screen.getByText("B (1)")).toBeInTheDocument(); // One occurrence of "b" in data
    });

    it("should throw error when no valid option configuration", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        // No options, transformOptionFn, and data doesn't conform to ColumnOption
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "plain string" },
        { getValue: () => "another string" },
      ];

      expect(() => {
        renderWithProviders(
          <PropertyFilterOptionValueMenu
            id="status"
            column={column}
            columnMeta={columnMeta}
            table={createMockTable(rows)}
          />
        );
      }).toThrow(
        "[data-table-filter] [status] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type"
      );
    });
  });

  describe("Option Counting", () => {
    it("should count occurrences correctly with static options", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "active" },
        { getValue: () => "active" },
        { getValue: () => "inactive" },
        { getValue: () => "active" },
        { getValue: () => null }, // Should be filtered out
        { getValue: () => undefined }, // Should be filtered out
      ];

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      const activeOption = screen.getByTestId("option-item-active");
      const inactiveOption = screen.getByTestId("option-item-inactive");

      expect(activeOption).toHaveAttribute("data-count", "3");
      expect(inactiveOption).toHaveAttribute("data-count", "1");
    });

    it("should count occurrences with transformOptionFn", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        transformOptionFn: (value: { id: string; name: string }) => ({
          value: value.id,
          label: value.name,
        }),
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => ({ id: "1", name: "One" }) },
        { getValue: () => ({ id: "2", name: "Two" }) },
        { getValue: () => ({ id: "1", name: "One" }) },
        { getValue: () => ({ id: "1", name: "One" }) },
      ];

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="data"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      // transformOptionFn properly processes unique values, so no duplicates
      expect(screen.getByTestId("option-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("option-item-2")).toBeInTheDocument();
      // Options show correct counts based on actual data occurrences
      expect(screen.getByTestId("option-item-1")).toHaveAttribute(
        "data-count",
        "3"
      );
      expect(screen.getByTestId("option-item-2")).toHaveAttribute(
        "data-count",
        "1"
      );
    });

    it("should show zero count for options not in data", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [
          { value: "exists", label: "Exists" },
          { value: "missing", label: "Missing" },
        ],
      } as ColumnMeta<unknown, unknown>;

      const rows = [{ getValue: () => "exists" }, { getValue: () => "exists" }];

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      expect(screen.getByTestId("option-item-exists")).toHaveAttribute(
        "data-count",
        "2"
      );
      expect(screen.getByTestId("option-item-missing")).toHaveAttribute(
        "data-count",
        "0"
      );
    });
  });

  describe("Selection Handling", () => {
    it("should select option and update filter", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({});
      column.setFilterValue = setFilterValue;

      const columnMeta = {
        type: "option",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      const activeOption = screen.getByTestId("option-item-active");
      await user.click(activeOption);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]![0]!;
      const result = updateFn();
      expect(result).toEqual({
        operator: "is",
        values: ["active"],
      });
    });

    it("should deselect option and clear filter", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: ["active"],
          columnMeta: { type: "option" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = {
        type: "option",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      const activeOption = screen.getByTestId("option-item-active");
      expect(activeOption).toHaveAttribute("data-checked", "true");

      await user.click(activeOption);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]![0]!;
      const result = updateFn();
      expect(result).toBeUndefined();
    });

    it("should switch selection from one option to another", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: ["active"],
          columnMeta: { type: "option" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = {
        type: "option",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      const inactiveOption = screen.getByTestId("option-item-inactive");
      await user.click(inactiveOption);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]![0]!;
      const result = updateFn();
      expect(result).toEqual({
        operator: "is",
        values: ["inactive"],
      });
    });
  });

  describe("Checked State", () => {
    it("should show option as checked when filter matches", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: ["active"],
          columnMeta: { type: "option" },
        },
      });

      const columnMeta = {
        type: "option",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByTestId("option-item-active")).toHaveAttribute(
        "data-checked",
        "true"
      );
      expect(screen.getByTestId("option-item-inactive")).toHaveAttribute(
        "data-checked",
        "false"
      );
    });

    it("should only check based on first value in filter", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: ["active", "inactive"], // Multiple values, but only first counts
          columnMeta: { type: "option" },
        },
      });

      const columnMeta = {
        type: "option",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByTestId("option-item-active")).toHaveAttribute(
        "data-checked",
        "true"
      );
      expect(screen.getByTestId("option-item-inactive")).toHaveAttribute(
        "data-checked",
        "false"
      );
    });

    it("should not check options when operator is not 'is'", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "is not" as const, // Different operator
          values: ["active"],
          columnMeta: { type: "option" },
        },
      });

      const columnMeta = {
        type: "option",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByTestId("option-item-active")).toHaveAttribute(
        "data-checked",
        "false"
      );
      expect(screen.getByTestId("option-item-inactive")).toHaveAttribute(
        "data-checked",
        "false"
      );
    });
  });

  describe("Search Functionality", () => {
    it("should render search input", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      const searchInput = screen.getByPlaceholderText("search");
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveAttribute("type", "text");
    });

    it("should show empty state when no results", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByText("noResults")).toBeInTheDocument();
    });
  });

  describe("Back Button", () => {
    it("should call onBack when back button is clicked", async () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByTestId("chevron-left-icon").parentElement;
      if (!backButton) throw new Error("Back button not found");
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty rows", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [
          { value: "active", label: "Active" },
          { value: "inactive", label: "Inactive" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByTestId("option-item-active")).toHaveAttribute(
        "data-count",
        "0"
      );
      expect(screen.getByTestId("option-item-inactive")).toHaveAttribute(
        "data-count",
        "0"
      );
    });

    it("should filter out null and undefined values", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [{ value: "valid", label: "Valid" }],
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "valid" },
        { getValue: () => null },
        { getValue: () => undefined },
        { getValue: () => "valid" },
      ];

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      expect(screen.getByTestId("option-item-valid")).toHaveAttribute(
        "data-count",
        "2"
      );
    });

    it("should handle complex option objects", () => {
      const IconComponent = () => <div data-testid="option-icon">🎯</div>;
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        options: [
          {
            value: "complex",
            label: "Complex Option",
            icon: IconComponent,
          },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="status"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByTestId("option-item-complex")).toBeInTheDocument();
      expect(screen.getByText("Complex Option (0)")).toBeInTheDocument();
    });

    it("should handle duplicate values in unique calculation", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "option",
        transformOptionFn: (value: string) => ({
          value: value,
          label: value.toUpperCase(),
        }),
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "test" },
        { getValue: () => "test" },
        { getValue: () => "test" },
        { getValue: () => "other" },
      ];

      renderWithProviders(
        <PropertyFilterOptionValueMenu
          id="data"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      // Should only show unique values
      expect(screen.getByTestId("option-item-test")).toBeInTheDocument();
      expect(screen.getByTestId("option-item-other")).toBeInTheDocument();
      expect(screen.getByText("TEST (3)")).toBeInTheDocument();
      expect(screen.getByText("OTHER (1)")).toBeInTheDocument();
    });
  });
});
