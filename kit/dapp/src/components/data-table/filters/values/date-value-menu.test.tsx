/**
 * @vitest-environment happy-dom
 */
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DateFilterOperator, FilterValue } from "../types/filter-types";
import { PropertyFilterDateValueMenu } from "./date-value-menu";
// Test data interface removed as it was unused

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
}));

// Mock date-fns
vi.mock("date-fns", () => ({
  isEqual: (date1: Date, date2: Date) => date1.getTime() === date2.getTime(),
}));

// Mock Calendar component
vi.mock("@/components/ui/calendar", () => ({
  Calendar: ({
    mode,
    selected,
    onSelect,
    defaultMonth,
    numberOfMonths,
  }: {
    mode: string;
    selected: unknown;
    onSelect: (date: Date | { from?: Date; to?: Date } | undefined) => void;
    defaultMonth?: Date;
    numberOfMonths?: number;
  }) => (
    <div
      data-testid="calendar"
      data-mode={mode}
      data-selected={JSON.stringify(selected)}
      data-default-month={defaultMonth?.toISOString()}
      data-number-of-months={numberOfMonths}
    >
      <button
        data-testid="select-single-date"
        onClick={() => {
          onSelect({ from: new Date("2024-01-15") });
        }}
      >
        Select Single Date
      </button>
      <button
        data-testid="select-date-range"
        onClick={() => {
          onSelect({
            from: new Date("2024-01-15"),
            to: new Date("2024-01-20"),
          });
        }}
      >
        Select Date Range
      </button>
      <button
        data-testid="select-same-date"
        onClick={() => {
          onSelect({
            from: new Date("2024-01-15"),
            to: new Date("2024-01-15"),
          });
        }}
      >
        Select Same Date
      </button>
      <button
        data-testid="clear-selection"
        onClick={() => {
          onSelect(undefined);
        }}
      >
        Clear Selection
      </button>
    </div>
  ),
}));

// Helper to create mock column
function createMockColumn<TData>({
  filterValue,
  meta = { type: "date" },
}: {
  filterValue?: FilterValue<"date", TData>;
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

// Helper to create mock table
function createMockTable() {
  return {} as unknown;
}

describe("PropertyFilterDateValueMenu", () => {
  const user = userEvent.setup();
  const mockOnClose = vi.fn();
  const mockOnBack = vi.fn();
  const TestIcon = () => <div data-testid="test-icon">📅</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with header and calendar", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "date",
        displayName: "Created Date",
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Created Date")).toBeInTheDocument();
      expect(screen.getByTestId("calendar")).toBeInTheDocument();
      expect(screen.getByTestId("calendar")).toHaveAttribute(
        "data-mode",
        "range"
      );
      expect(screen.getByTestId("calendar")).toHaveAttribute(
        "data-number-of-months",
        "1"
      );
    });

    it("should render with icon when provided", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "date",
        displayName: "Created Date",
        icon: TestIcon,
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("should render back button when onBack is provided", () => {
      const column = createMockColumn({});
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId("chevron-left-icon")).toBeInTheDocument();
    });

    it("should use 'Filter' as default display name", () => {
      const column = createMockColumn({});
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      expect(screen.getByText("Filter")).toBeInTheDocument();
    });
  });

  describe("Initial State", () => {
    it("should initialize with today's date when no filter exists", () => {
      const column = createMockColumn({ filterValue: undefined });
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const calendar = screen.getByTestId("calendar");
      const selected = JSON.parse(calendar.dataset.selected || "{}") as {
        from?: string;
        to?: string;
      };

      // Should have a from date but no to date
      expect(selected?.from).toBeDefined();
      expect(selected?.to).toBeUndefined();
    });

    it("should initialize with existing single date filter", () => {
      const testDate = new Date("2024-01-10");
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: [testDate],
          columnMeta: { type: "date" },
        },
      });
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const calendar = screen.getByTestId("calendar");
      const selected = JSON.parse(calendar.dataset.selected || "{}") as {
        from?: string;
        to?: string;
      };

      expect(selected.from ? new Date(selected.from) : undefined).toEqual(
        testDate
      );
      expect(selected?.to).toBeUndefined();
    });

    it("should initialize with existing date range filter", () => {
      const startDate = new Date("2024-01-10");
      const endDate = new Date("2024-01-20");
      const column = createMockColumn({
        filterValue: {
          operator: "is between",
          values: [startDate, endDate],
          columnMeta: { type: "date" },
        },
      });
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const calendar = screen.getByTestId("calendar");
      const selected = JSON.parse(calendar.dataset.selected || "{}") as {
        from?: string;
        to?: string;
      };

      expect(selected.from ? new Date(selected.from) : undefined).toEqual(
        startDate
      );
      expect(selected.to ? new Date(selected.to) : undefined).toEqual(endDate);
    });
  });

  describe("Date Selection", () => {
    it("should handle single date selection", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({ meta: columnMeta });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const selectButton = screen.getByTestId("select-single-date");
      await user.click(selectButton);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn?.(undefined);

      expect(result).toEqual({
        operator: "is",
        values: [new Date("2024-01-15")],
        columnMeta: columnMeta,
      });
    });

    it("should handle date range selection", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({ meta: columnMeta });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const selectButton = screen.getByTestId("select-date-range");
      await user.click(selectButton);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn?.(undefined);

      expect(result).toEqual({
        operator: "is between",
        values: [new Date("2024-01-15"), new Date("2024-01-20")],
        columnMeta: columnMeta,
      });
    });

    it("should treat same start and end date as single date", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({ meta: columnMeta });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const selectButton = screen.getByTestId("select-same-date");
      await user.click(selectButton);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn?.(undefined);

      expect(result).toEqual({
        operator: "is",
        values: [new Date("2024-01-15")],
        columnMeta: columnMeta,
      });
    });

    it("should clear filter when selection is cleared", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: [new Date("2024-01-10")],
          columnMeta: columnMeta,
        },
        meta: columnMeta,
      });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const clearButton = screen.getByTestId("clear-selection");
      await user.click(clearButton);

      expect(setFilterValue).toHaveBeenCalledTimes(1);
      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn?.({
        operator: "is",
        values: [new Date("2024-01-10")],
        columnMeta: columnMeta,
      });

      expect(result).toEqual({
        operator: "is",
        values: [],
        columnMeta: columnMeta,
      });
    });
  });

  describe("Operator Transitions", () => {
    it("should switch from 'is' to 'is between' when range is selected", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: [new Date("2024-01-10")],
          columnMeta: { type: "date" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const selectButton = screen.getByTestId("select-date-range");
      await user.click(selectButton);

      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn?.({
        operator: "is",
        values: [new Date("2024-01-10")],
        columnMeta: { type: "date" },
      });

      expect(result.operator).toBe("is between");
      expect(result.values).toHaveLength(2);
    });

    it("should switch from 'is between' to 'is' when single date is selected", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "is between",
          values: [new Date("2024-01-10"), new Date("2024-01-20")],
          columnMeta: { type: "date" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const selectButton = screen.getByTestId("select-single-date");
      await user.click(selectButton);

      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn?.({
        operator: "is between",
        values: [new Date("2024-01-10"), new Date("2024-01-20")],
        columnMeta: { type: "date" },
      });

      expect(result.operator).toBe("is");
      expect(result.values).toHaveLength(1);
    });

    it("should preserve custom operators when values don't require change", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "is after" as DateFilterOperator, // Custom operator
          values: [new Date("2024-01-10")],
          columnMeta: { type: "date" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const selectButton = screen.getByTestId("select-single-date");
      await user.click(selectButton);

      const updateFn = setFilterValue.mock.calls[0]?.[0];
      const result = updateFn?.({
        operator: "is after",
        values: [new Date("2024-01-10")],
        columnMeta: { type: "date" },
      });

      expect(result.operator).toBe("is after"); // Preserved
      expect(result.values).toHaveLength(1);
    });
  });

  describe("Back Button", () => {
    it("should call onBack when back button is clicked", async () => {
      const column = createMockColumn({});
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onBack={mockOnBack}
        />
      );

      const backButton = screen.getByTestId("chevron-left-icon").parentElement;
      await user.click(backButton!);

      expect(mockOnBack).toHaveBeenCalled();
    });

    it("should not render back button when onBack is not provided", () => {
      const column = createMockColumn({});
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      expect(screen.queryByTestId("chevron-left-icon")).not.toBeInTheDocument();
    });
  });

  describe("Calendar Props", () => {
    it("should pass correct props to Calendar component", () => {
      const testDate = new Date("2024-01-15");
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: [testDate],
          columnMeta: { type: "date" },
        },
      });
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const calendar = screen.getByTestId("calendar");
      expect(calendar).toHaveAttribute("data-mode", "range");
      expect(calendar).toHaveAttribute("data-number-of-months", "1");
      expect(calendar).toHaveAttribute(
        "data-default-month",
        testDate.toISOString()
      );
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty filter values array", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "is",
          values: [],
          columnMeta: { type: "date" },
        },
      });
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const calendar = screen.getByTestId("calendar");
      const selected = JSON.parse(calendar.dataset.selected || "{}") as {
        from?: string;
        to?: string;
      };

      // Should default to today's date
      expect(selected?.from).toBeDefined();
      expect(selected?.to).toBeUndefined();
    });

    it("should handle undefined values in filter", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "is between",
          values: [undefined as unknown as Date, undefined as unknown as Date],
          columnMeta: { type: "date" },
        },
      });
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const calendar = screen.getByTestId("calendar");
      const selected = JSON.parse(calendar.dataset.selected || "{}") as {
        from?: string;
        to?: string;
      };

      // Should handle gracefully
      expect(selected?.from).toBeDefined(); // Defaults to today
      expect(selected?.to).toBeUndefined();
    });

    it("should update local state when date changes", async () => {
      const column = createMockColumn({});
      const columnMeta = { type: "date" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterDateValueMenu
          id="createdAt"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      // Initially check state
      let calendar = screen.getByTestId("calendar");
      let selected = JSON.parse(calendar.dataset.selected || "{}") as {
        from?: string;
        to?: string;
      };
      const initialFrom = selected.from;

      // Select a date range
      const selectButton = screen.getByTestId("select-date-range");
      await user.click(selectButton);

      // State should be updated
      calendar = screen.getByTestId("calendar");
      selected = JSON.parse(calendar.dataset.selected || "{}");

      expect(selected?.from).toBeDefined();
      expect(selected?.to).toBeDefined();
      expect(
        selected.from && initialFrom ? new Date(selected.from) : undefined
      ).not.toEqual(initialFrom ? new Date(initialFrom) : undefined);
    });
  });
});
