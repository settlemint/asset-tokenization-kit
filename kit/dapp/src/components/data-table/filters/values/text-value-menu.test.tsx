/**
 * @vitest-environment happy-dom
 */
import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { renderWithProviders } from "@test/helpers/test-utils";
import { fireEvent, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FilterValue } from "../types/filter-types";
import { PropertyFilterTextValueMenu } from "./text-value-menu";

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

// Helper to create mock column
function createMockColumn<TData>({
  filterValue,
  meta = { type: "text" },
}: {
  filterValue?: FilterValue<"text", TData>;
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

describe("PropertyFilterTextValueMenu", () => {
  const user = userEvent.setup();
  const mockOnClose = vi.fn();
  const mockOnBack = vi.fn();
  const TestIcon = () => <div data-testid="test-icon">📝</div>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render with header and input elements", () => {
      const column = createMockColumn({});
      const columnMeta = { type: "text", displayName: "Name" } as ColumnMeta<
        unknown,
        unknown
      >;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("filters.text.placeholder")
      ).toBeInTheDocument();
      expect(screen.getByText("filters.text.contains")).toBeInTheDocument();
      expect(
        screen.getByText("filters.text.doesNotContain")
      ).toBeInTheDocument();
      expect(screen.getByText("apply")).toBeInTheDocument();
      expect(screen.getByText("clear")).toBeInTheDocument();
    });

    it("should render with icon when provided", () => {
      const column = createMockColumn({});
      const columnMeta = {
        type: "text",
        displayName: "Name",
        icon: TestIcon,
      } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      expect(screen.getByTestId("test-icon")).toBeInTheDocument();
    });

    it("should render back button when onBack is provided", () => {
      const column = createMockColumn({});
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onBack={mockOnBack}
        />
      );

      expect(screen.getByTestId("chevron-left-icon")).toBeInTheDocument();
    });

    it("should use 'Filter' as default display name when not provided", () => {
      const column = createMockColumn({});
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      expect(screen.getByText("Filter")).toBeInTheDocument();
    });
  });

  describe("Initial State", () => {
    it("should initialize with 'contains' operator when no filter exists", () => {
      const column = createMockColumn({ filterValue: undefined });
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const containsButton = screen.getByText("filters.text.contains");
      const doesNotContainButton = screen.getByText(
        "filters.text.doesNotContain"
      );

      // Default state: contains is selected
      expect(containsButton).toBeInTheDocument();
      expect(doesNotContainButton).toBeInTheDocument();
    });

    it("should initialize with existing filter values", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "does not contain",
          values: ["test value"],
          columnMeta: { type: "text" },
        },
      });
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      expect((input as HTMLInputElement).value).toBe("test value");

      const containsButton = screen.getByText("filters.text.contains");
      const doesNotContainButton = screen.getByText(
        "filters.text.doesNotContain"
      );

      // Verify operator state from filter value
      expect(containsButton).toBeInTheDocument();
      expect(doesNotContainButton).toBeInTheDocument();
    });
  });

  describe("Operator Selection", () => {
    it("should switch to 'contains' operator when clicked", async () => {
      const column = createMockColumn({
        filterValue: {
          operator: "does not contain",
          values: ["test"],
          columnMeta: { type: "text" },
        },
      });
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const containsButton = screen.getByText("filters.text.contains");
      await user.click(containsButton);

      // Verify button was clicked
      expect(containsButton).toBeInTheDocument();
    });

    it("should switch to 'does not contain' operator when clicked", async () => {
      const column = createMockColumn({});
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const doesNotContainButton = screen.getByText(
        "filters.text.doesNotContain"
      );
      await user.click(doesNotContainButton);

      // Verify button was clicked
      expect(doesNotContainButton).toBeInTheDocument();
    });
  });

  describe("Input Handling", () => {
    it("should update value as user types", async () => {
      const column = createMockColumn({});
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.type(input, "hello world");

      expect((input as HTMLInputElement).value).toBe("hello world");
    });

    it("should handle empty initial value", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "contains",
          values: [],
          columnMeta: { type: "text" },
        },
      });
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      expect((input as HTMLInputElement).value).toBe("");
    });
  });

  describe("Apply Filter", () => {
    it("should apply filter with contains operator", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({ meta: columnMeta });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.type(input, "test value");

      const applyButton = screen.getByText("apply");
      await user.click(applyButton);

      expect(setFilterValue).toHaveBeenCalledWith({
        operator: "contains",
        values: ["test value"],
        columnMeta: columnMeta,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should apply filter with does not contain operator", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({ meta: columnMeta });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      const doesNotContainButton = screen.getByText(
        "filters.text.doesNotContain"
      );
      await user.click(doesNotContainButton);

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.type(input, "exclude this");

      const applyButton = screen.getByText("apply");
      await user.click(applyButton);

      expect(setFilterValue).toHaveBeenCalledWith({
        operator: "does not contain",
        values: ["exclude this"],
        columnMeta: columnMeta,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should clear filter when applying empty value", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "contains",
          values: ["existing"],
          columnMeta: { type: "text" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.clear(input);

      const applyButton = screen.getByText("apply");
      await user.click(applyButton);

      expect(setFilterValue).toHaveBeenCalledWith(undefined);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should clear filter when applying only whitespace", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({});
      column.setFilterValue = setFilterValue;

      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.type(input, "   ");

      const applyButton = screen.getByText("apply");
      await user.click(applyButton);

      expect(setFilterValue).toHaveBeenCalledWith(undefined);
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Clear Filter", () => {
    it("should clear filter and close menu", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({
        filterValue: {
          operator: "contains",
          values: ["existing value"],
          columnMeta: { type: "text" },
        },
      });
      column.setFilterValue = setFilterValue;

      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      const clearButton = screen.getByText("clear");
      await user.click(clearButton);

      expect(setFilterValue).toHaveBeenCalledWith(undefined);
      expect(mockOnClose).toHaveBeenCalled();

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      expect((input as HTMLInputElement).value).toBe("");
    });

    it("should clear input value when clear button is clicked", async () => {
      const column = createMockColumn({});
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.type(input, "some text");

      const clearButton = screen.getByText("clear");
      await user.click(clearButton);

      expect((input as HTMLInputElement).value).toBe("");
    });
  });

  describe("Keyboard Shortcuts", () => {
    it("should apply filter when Enter is pressed", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({ meta: columnMeta });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.type(input, "test value");

      fireEvent.keyDown(input, { key: "Enter" });

      expect(setFilterValue).toHaveBeenCalledWith({
        operator: "contains",
        values: ["test value"],
        columnMeta: columnMeta,
      });
      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should not apply filter when other keys are pressed", async () => {
      const setFilterValue = vi.fn();
      const column = createMockColumn({});
      column.setFilterValue = setFilterValue;

      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.type(input, "test");

      fireEvent.keyDown(input, { key: "Escape" });
      fireEvent.keyDown(input, { key: "Tab" });

      expect(setFilterValue).not.toHaveBeenCalled();
    });
  });

  describe("Back Button", () => {
    it("should call onBack when back button is clicked", async () => {
      const column = createMockColumn({});
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
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
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      expect(screen.queryByTestId("chevron-left-icon")).not.toBeInTheDocument();
    });
  });

  describe("Complex Scenarios", () => {
    it("should preserve operator when changing value", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({
        filterValue: {
          operator: "does not contain",
          values: ["old value"],
          columnMeta: columnMeta,
        },
        meta: columnMeta,
      });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.clear(input);
      await user.type(input, "new value");

      const applyButton = screen.getByText("apply");
      await user.click(applyButton);

      expect(setFilterValue).toHaveBeenCalledWith({
        operator: "does not contain",
        values: ["new value"],
        columnMeta: columnMeta,
      });
    });

    it("should update operator without applying immediately", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({ meta: columnMeta });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const doesNotContainButton = screen.getByText(
        "filters.text.doesNotContain"
      );
      await user.click(doesNotContainButton);

      // Filter should not be applied yet
      expect(setFilterValue).not.toHaveBeenCalled();

      // Now type and apply
      const input = screen.getByPlaceholderText("filters.text.placeholder");
      await user.type(input, "test");

      const applyButton = screen.getByText("apply");
      await user.click(applyButton);

      expect(setFilterValue).toHaveBeenCalledWith({
        operator: "does not contain",
        values: ["test"],
        columnMeta: columnMeta,
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined filter value gracefully", () => {
      const column = createMockColumn({ filterValue: undefined });
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      expect((input as HTMLInputElement).value).toBe("");
    });

    it("should handle filter with empty values array", () => {
      const column = createMockColumn({
        filterValue: {
          operator: "contains",
          values: [],
          columnMeta: { type: "text" },
        },
      });
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      expect((input as HTMLInputElement).value).toBe("");
    });

    it("should handle special characters in input", async () => {
      const setFilterValue = vi.fn();
      const columnMeta = { type: "text" } as ColumnMeta<unknown, unknown>;
      const column = createMockColumn({ meta: columnMeta });
      column.setFilterValue = setFilterValue;

      renderWithProviders(
        <PropertyFilterTextValueMenu
          id="name"
          column={column}
          columnMeta={columnMeta}
          table={createMockTable() as Table<unknown>}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText("filters.text.placeholder");
      const specialChars = "!@#$%^&*()_+<>?~`;',./";
      await user.type(input, specialChars);

      const applyButton = screen.getByText("apply");
      await user.click(applyButton);

      expect(setFilterValue).toHaveBeenCalledWith({
        operator: "contains",
        values: [specialChars],
        columnMeta: columnMeta,
      });
    });
  });
});
