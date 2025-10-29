/**
 * @vitest-environment happy-dom
 */
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FilterValue } from "../types/filter-types";
import { PropertyFilterMultiOptionValueMenu } from "./multi-option-value-menu";
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
  ChevronLeft: () => <div data-testid="chevron-left-icon">←</div>,
  SearchIcon: () => <div data-testid="search-icon">🔍</div>,
}));

// Mock the uniq function
vi.mock("../../data-table-array", () => ({
  uniq: (arr: unknown[]) => [...new Set(arr)],
}));

// Mock determineNewOperator
vi.mock("../operators/operator-utils", () => ({
  determineNewOperator: vi.fn((_type, _oldValues, newValues, oldOperator) => {
    // Simple mock logic
    if (newValues[0]?.length === 0) return oldOperator;
    if (newValues[0]?.length > 0 && oldOperator === "include")
      return "include any of";
    return oldOperator;
  }),
}));

// Mock the MultiOptionItem component for easier testing
vi.mock("./multi-option-item", () => ({
  MultiOptionItem: ({
    option,
    checked,
    count,
    onSelect,
  }: {
    option: { value: string; label: string };
    checked: boolean;
    count?: number;
    onSelect: (value: string, checked: boolean) => void;
  }) => (
    <div
      data-testid={`multi-option-item-${option.value}`}
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
  meta = { type: "multiOption" },
}: {
  filterValue?: FilterValue<"multiOption", TData>;
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

describe("PropertyFilterMultiOptionValueMenu", () => {
  const user = userEvent.setup();
  const mockOnClose = vi.fn();
  const mockOnBack = vi.fn();
  const TestIcon = () => <div data-testid="test-icon">🏷️</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with static options", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        displayName: "Tags",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Tags")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
      expect(screen.getByTestId("multi-option-item-tag1")).toBeInTheDocument();
      expect(screen.getByTestId("multi-option-item-tag2")).toBeInTheDocument();
    });

    it("should render with icon when provided", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        displayName: "Tags",
        icon: TestIcon,
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
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
        type: "multiOption",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
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
        type: "multiOption",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
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
        type: "multiOption",
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
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      // Should show static options, not dynamic ones
      expect(screen.getByTestId("multi-option-item-opt1")).toBeInTheDocument();
      expect(screen.getByTestId("multi-option-item-opt2")).toBeInTheDocument();
      expect(
        screen.queryByTestId("multi-option-item-different")
      ).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("multi-option-item-values")
      ).not.toBeInTheDocument();
    });

    it("should generate options using transformOptionFn", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        transformOptionFn: (value: string) => ({
          value: value.toLowerCase(),
          label: value.toUpperCase(),
        }),
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "Red" },
        { getValue: () => "Blue" },
        { getValue: () => "Red" }, // Duplicate
        { getValue: () => "Green" },
      ];

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="colors"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      // Should show unique transformed options
      expect(screen.getByTestId("multi-option-item-red")).toBeInTheDocument();
      expect(screen.getByText("RED (2)")).toBeInTheDocument(); // Count is 2
      expect(screen.getByTestId("multi-option-item-blue")).toBeInTheDocument();
      expect(screen.getByText("BLUE (1)")).toBeInTheDocument();
      expect(screen.getByTestId("multi-option-item-green")).toBeInTheDocument();
      expect(screen.getByText("GREEN (1)")).toBeInTheDocument();
    });

    it("should use column data directly when it conforms to ColumnOption", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => ({ value: "a", label: "A" }) },
        { getValue: () => ({ value: "b", label: "B" }) },
        { getValue: () => ({ value: "a", label: "A" }) }, // Duplicate
      ];

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="options"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      // Objects are now properly deduplicated by value property
      expect(screen.getByTestId("multi-option-item-a")).toBeInTheDocument();
      expect(screen.getByTestId("multi-option-item-b")).toBeInTheDocument();
      // Options show correct counts based on actual data occurrences
      expect(screen.getByText("A (2)")).toBeInTheDocument(); // Two occurrences of "a" in data
      expect(screen.getByText("B (1)")).toBeInTheDocument(); // One occurrence of "b" in data
    });

    it("should throw error when no valid option configuration", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        // No options, transformOptionFn, and data doesn't conform to ColumnOption
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "plain string" },
        { getValue: () => "another string" },
      ];

      expect(() => {
        renderWithProviders(
          <PropertyFilterMultiOptionValueMenu
            id="tags"
            column={column}
            columnMeta={columnMeta}
            table={createMockTable(rows)}
          />
        );
      }).toThrow(
        "[data-table-filter] [tags] Either provide static options, a transformOptionFn, or ensure the column data conforms to ColumnOption type"
      );
    });
  });

  describe("Option Counting", () => {
    it("should count occurrences correctly with static options", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "tag1" },
        { getValue: () => "tag1" },
        { getValue: () => "tag2" },
        { getValue: () => "tag1" },
        { getValue: () => null }, // Should be filtered out
        { getValue: () => undefined }, // Should be filtered out
      ];

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      const tag1Option = screen.getByTestId("multi-option-item-tag1");
      const tag2Option = screen.getByTestId("multi-option-item-tag2");

      expect(tag1Option).toHaveAttribute("data-count", "3");
      expect(tag2Option).toHaveAttribute("data-count", "1");
    });

    it("should count occurrences with transformOptionFn", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
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
        <PropertyFilterMultiOptionValueMenu
          id="data"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      // transformOptionFn properly processes unique values, so no duplicates
      expect(screen.getByTestId("multi-option-item-1")).toBeInTheDocument();
      expect(screen.getByTestId("multi-option-item-2")).toBeInTheDocument();
      // Options show correct counts based on actual data occurrences
      expect(screen.getByTestId("multi-option-item-1")).toHaveAttribute(
        "data-count",
        "3"
      );
      expect(screen.getByTestId("multi-option-item-2")).toHaveAttribute(
        "data-count",
        "1"
      );
    });

    it("should show zero count for options not in data", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "exists", label: "Exists" },
          { value: "missing", label: "Missing" },
        ],
      } as ColumnMeta<unknown, unknown>;

      const rows = [{ getValue: () => "exists" }, { getValue: () => "exists" }];

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      expect(screen.getByTestId("multi-option-item-exists")).toHaveAttribute(
        "data-count",
        "2"
      );
      expect(screen.getByTestId("multi-option-item-missing")).toHaveAttribute(
        "data-count",
        "0"
      );
    });
  });

  describe("Selection Handling", () => {
    it("should select single option and create filter", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({});
      column.setFilterValue = setFilterValue;

      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      const tag1Option = screen.getByTestId("multi-option-item-tag1");
      await user.click(tag1Option);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]![0]!;
      const result = updateFn(undefined);
      expect(result).toEqual({
        operator: "include any of",
        values: [["tag1"]],
      });
    });

    it("should add option to existing filter", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "include any of",
          values: [["tag1"]],
          columnMeta: { type: "multiOption" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      const tag2Option = screen.getByTestId("multi-option-item-tag2");
      await user.click(tag2Option);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]![0]!;
      const result = updateFn({
        operator: "include any of",
        values: [["tag1"]],
        columnMeta: { type: "multiOption" },
      });
      expect(result).toEqual({
        operator: "include any of",
        values: [["tag1", "tag2"]],
      });
    });

    it("should remove option from filter", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "include any of",
          values: [["tag1", "tag2"]],
          columnMeta: { type: "multiOption" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      const tag1Option = screen.getByTestId("multi-option-item-tag1");
      await user.click(tag1Option);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]![0]!;
      const result = updateFn({
        operator: "include any of",
        values: [["tag1", "tag2"]],
        columnMeta: { type: "multiOption" },
      });
      expect(result).toEqual({
        operator: "include any of",
        values: [["tag2"]],
        columnMeta: { type: "multiOption" },
      });
    });

    it("should clear filter when last option is removed", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "include any of",
          values: [["tag1"]],
          columnMeta: { type: "multiOption" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      const tag1Option = screen.getByTestId("multi-option-item-tag1");
      await user.click(tag1Option);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]![0]!;
      const result = updateFn({
        operator: "include any of",
        values: [["tag1"]],
        columnMeta: { type: "multiOption" },
      });
      expect(result).toBeUndefined();
    });
  });

  describe("Checked State", () => {
    it("should show options as checked when in filter", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "include any of",
          values: [["tag1", "tag3"]],
          columnMeta: { type: "multiOption" },
        },
      });

      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
          { value: "tag3", label: "Tag 3" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByTestId("multi-option-item-tag1")).toHaveAttribute(
        "data-checked",
        "true"
      );
      expect(screen.getByTestId("multi-option-item-tag2")).toHaveAttribute(
        "data-checked",
        "false"
      );
      expect(screen.getByTestId("multi-option-item-tag3")).toHaveAttribute(
        "data-checked",
        "true"
      );
    });

    it("should handle empty values array in filter", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "include any of",
          values: [],
          columnMeta: { type: "multiOption" },
        },
      });

      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByTestId("multi-option-item-tag1")).toHaveAttribute(
        "data-checked",
        "false"
      );
      expect(screen.getByTestId("multi-option-item-tag2")).toHaveAttribute(
        "data-checked",
        "false"
      );
    });
  });

  describe("Search Functionality", () => {
    it("should render search input", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
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
        type: "multiOption",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
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
        type: "multiOption",
        options: [{ value: "test", label: "Test" }],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByTestId("chevron-left-icon").parentElement;
      await user.click(backButton!);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty rows", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      expect(screen.getByTestId("multi-option-item-tag1")).toHaveAttribute(
        "data-count",
        "0"
      );
      expect(screen.getByTestId("multi-option-item-tag2")).toHaveAttribute(
        "data-count",
        "0"
      );
    });

    it("should filter out null and undefined values", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        options: [{ value: "valid", label: "Valid" }],
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "valid" },
        { getValue: () => null },
        { getValue: () => undefined },
        { getValue: () => "valid" },
      ];

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      expect(screen.getByTestId("multi-option-item-valid")).toHaveAttribute(
        "data-count",
        "2"
      );
    });

    it("should handle duplicate values with uniq", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "include any of",
          values: [["tag1", "tag1"]], // Duplicates
          columnMeta: { type: "multiOption" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable([])}
        />
      );

      const tag2Option = screen.getByTestId("multi-option-item-tag2");
      await user.click(tag2Option);

      const updateFn = setFilterValue.mock.calls[0]![0]!;
      const result = updateFn({
        operator: "include any of",
        values: [["tag1", "tag1"]],
        columnMeta: { type: "multiOption" },
      });

      // Should have deduped the values
      expect(result.values[0]).toContain("tag1");
      expect(result.values[0]).toContain("tag2");
      expect(result.values[0]).toHaveLength(2); // Not 3
    });

    it("should handle missing values in count calculation", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "multiOption",
        options: [
          { value: "tag1", label: "Tag 1" },
          { value: "tag2", label: "Tag 2" },
        ],
      } as ColumnMeta<unknown, unknown>;

      const rows = [
        { getValue: () => "tag1" },
        { getValue: () => "nonexistent" }, // Not in options
        { getValue: () => "tag2" },
      ];

      renderWithProviders(
        <PropertyFilterMultiOptionValueMenu
          id="tags"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable(rows)}
        />
      );

      expect(screen.getByTestId("multi-option-item-tag1")).toHaveAttribute(
        "data-count",
        "1"
      );
      expect(screen.getByTestId("multi-option-item-tag2")).toHaveAttribute(
        "data-count",
        "1"
      );
    });
  });
});
