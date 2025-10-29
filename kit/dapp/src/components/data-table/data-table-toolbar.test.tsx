/**
 * @vitest-environment happy-dom
 */
import { createMockTable, renderWithProviders } from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataTableToolbar } from "./data-table-toolbar";

// Mock child components
vi.mock("./data-table-filter", () => ({
  DataTableFilter: ({ table: _table }: { table: unknown }) => (
    <div data-testid="data-table-filter">Filter Component</div>
  ),
}));

vi.mock("./data-table-view-options", () => ({
  DataTableViewOptions: ({ table: _table }: { table: unknown }) => (
    <div data-testid="data-table-view-options">View Options Component</div>
  ),
}));

vi.mock("./data-table-export", () => ({
  DataTableExport: ({ table: _table }: { table: unknown }) => (
    <div data-testid="data-table-export">Export Component</div>
  ),
}));

describe("DataTableToolbar", () => {
  describe("Component Rendering", () => {
    it("should render toolbar with all components when enabled", () => {
      const mockTable = createMockTable();
      const defaultState = mockTable.getState();
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultState,
        columnFilters: [],
      });

      const { container } = renderWithProviders(
        <DataTableToolbar table={mockTable} />
      );

      expect(
        container.querySelector(".flex.items-center.justify-between")
      ).toBeInTheDocument();
      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-view-options")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-export")).toBeInTheDocument();
    });

    it("should not render when enableToolbar is false", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableToolbar table={mockTable} enableToolbar={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render with correct layout structure", () => {
      const mockTable = createMockTable();
      const defaultState = mockTable.getState();
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultState,
        columnFilters: [],
      });

      const { container } = renderWithProviders(
        <DataTableToolbar table={mockTable} />
      );

      const toolbar = container.firstElementChild;
      expect(toolbar).toHaveClass("flex", "items-center", "justify-between");

      // Left side with filter
      const leftSide = toolbar?.firstElementChild;
      expect(leftSide).toHaveClass("flex", "items-center", "space-x-2");
      expect(leftSide?.firstElementChild).toHaveAttribute(
        "data-testid",
        "data-table-filter"
      );

      // Right side with view options and export
      const rightSide = toolbar?.lastElementChild;
      expect(rightSide).toHaveClass("flex", "items-center", "space-x-2");
    });
  });

  describe("Clear Filters Button", () => {
    it("should show clear filters button when filters are applied", () => {
      const mockTable = createMockTable();
      const defaultState = mockTable.getState();
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultState,
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(<DataTableToolbar table={mockTable} />);

      const clearButton = screen.getByRole("button");
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveClass("group", "h-8", "w-8", "p-0");

      // Check for icon
      const icon = clearButton.querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass("h-4", "w-4");
    });

    it("should not show clear filters button when no filters are applied", () => {
      const mockTable = createMockTable();
      const defaultState = mockTable.getState();
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultState,
        columnFilters: [],
      });

      renderWithProviders(<DataTableToolbar table={mockTable} />);

      // Only the view options and export buttons should exist
      const buttons = screen.queryAllByRole("button");
      // Filter out buttons from child components
      const clearButton = buttons.find((btn) =>
        btn.classList.contains("group")
      );
      expect(clearButton).toBeUndefined();
    });

    it("should clear all filters when clear button is clicked", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable();
      const defaultState = mockTable.getState();
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultState,
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(<DataTableToolbar table={mockTable} />);

      const clearButton = screen.getByRole("button");
      await user.click(clearButton);

      expect(mockTable.setColumnFilters).toHaveBeenCalledWith([]);
      expect(mockTable.setGlobalFilter).toHaveBeenCalledWith("");
    });

    it("should have animation classes on clear button", () => {
      const mockTable = createMockTable();
      const defaultState = mockTable.getState();
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultState,
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(<DataTableToolbar table={mockTable} />);

      const clearButton = screen.getByRole("button");
      expect(clearButton).toHaveClass("animate-in", "fade-in-0", "zoom-in-95");
    });
  });

  describe("Component Integration", () => {
    it("should pass table prop to all child components", () => {
      const mockTable = createMockTable();

      renderWithProviders(<DataTableToolbar table={mockTable} />);

      // All child components should be rendered
      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-view-options")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-export")).toBeInTheDocument();
    });

    it("should render components in correct order", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableToolbar table={mockTable} />
      );

      const toolbar = container.firstElementChild;
      const leftSection = toolbar?.firstElementChild;
      const rightSection = toolbar?.lastElementChild;

      // Filter should be in left section
      expect(
        leftSection?.querySelector('[data-testid="data-table-filter"]')
      ).toBeInTheDocument();

      // View options and export should be in right section
      expect(
        rightSection?.querySelector('[data-testid="data-table-view-options"]')
      ).toBeInTheDocument();
      expect(
        rightSection?.querySelector('[data-testid="data-table-export"]')
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle multiple filters", () => {
      const mockTable = createMockTable();
      const defaultState = mockTable.getState();
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultState,
        columnFilters: [
          { id: "name", value: "test" },
          { id: "status", value: "active" },
          { id: "type", value: "premium" },
        ],
      });

      renderWithProviders(<DataTableToolbar table={mockTable} />);

      const clearButton = screen.getByRole("button");
      expect(clearButton).toBeInTheDocument();
    });

    it("should handle empty filter values", () => {
      const mockTable = createMockTable();
      const defaultState = mockTable.getState();
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...defaultState,
        columnFilters: [{ id: "name", value: "" }],
      });

      renderWithProviders(<DataTableToolbar table={mockTable} />);

      // Empty filter still counts as a filter
      const clearButton = screen.getByRole("button");
      expect(clearButton).toBeInTheDocument();
    });

    it("should work with default enableToolbar value", () => {
      const mockTable = createMockTable();

      renderWithProviders(<DataTableToolbar table={mockTable} />);

      // Should render by default
      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
    });
  });
});
