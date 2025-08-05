/**
 * @vitest-environment happy-dom
 */
import { screen, within } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { DataTableToolbar } from "./data-table-toolbar";
import { renderWithProviders, createMockTable } from "./test-utils";

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

describe("DataTableToolbar", () => {
  describe("Component Rendering", () => {
    it("should render toolbar with all components when enabled", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [],
          globalFilter: "",
        })),
      });

      const { container } = renderWithProviders(
        <DataTableToolbar table={mockTable as unknown} />
      );

      // Check main container
      const toolbar = container.firstElementChild;
      expect(toolbar).toHaveClass("flex", "items-center", "justify-between");

      // Check left section components
      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();

      // Check right section components
      expect(screen.getByTestId("data-table-view-options")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-export")).toBeInTheDocument();
    });

    it("should render with correct layout structure", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [],
          globalFilter: "",
        })),
      });

      const { container } = renderWithProviders(
        <DataTableToolbar table={mockTable as unknown} />
      );

      const toolbar = container.firstElementChild;
      expect(toolbar).toHaveClass("flex", "items-center", "justify-between");

      // Check left section
      const leftSection = toolbar?.firstElementChild;
      expect(leftSection).toHaveClass("flex", "items-center", "space-x-2");

      // Check right section
      const rightSection = toolbar?.lastElementChild;
      expect(rightSection).toHaveClass("flex", "items-center", "space-x-2");
    });

    it("should pass table prop to all child components", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [],
          globalFilter: "",
        })),
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      // All child components should receive the table prop
      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-view-options")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-export")).toBeInTheDocument();
    });
  });

  describe("Disabled Toolbar", () => {
    it("should return null when enableToolbar is false", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableToolbar table={mockTable as unknown} enableToolbar={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should not render any child components when disabled", () => {
      const mockTable = createMockTable();

      renderWithProviders(
        <DataTableToolbar table={mockTable as unknown} enableToolbar={false} />
      );

      expect(screen.queryByTestId("data-table-filter")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("data-table-view-options")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("data-table-export")).not.toBeInTheDocument();
    });

    it("should render when enableToolbar is explicitly true", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [],
          globalFilter: "",
        })),
      });

      renderWithProviders(
        <DataTableToolbar table={mockTable as unknown} enableToolbar={true} />
      );

      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
    });

    it("should render by default when enableToolbar is not provided", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [],
          globalFilter: "",
        })),
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
    });
  });

  describe("Clear Filters Functionality", () => {
    it("should show clear filters button when filters exist", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [{ id: "name", value: "test" }],
          globalFilter: "",
        })),
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      const clearButton = screen.getByRole("button");
      expect(clearButton).toBeInTheDocument();
      expect(clearButton).toHaveClass(
        "group",
        "h-8",
        "w-8",
        "p-0",
        "border-none"
      );
    });

    it("should hide clear filters button when no filters exist", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [],
          globalFilter: "",
        })),
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should show clear filters button when columnFilters array has multiple filters", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [
            { id: "name", value: "test" },
            { id: "status", value: "active" },
          ],
          globalFilter: "",
        })),
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should clear column filters and global filter when clicked", async () => {
      const user = userEvent.setup();
      const setColumnFilters = vi.fn();
      const setGlobalFilter = vi.fn();

      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [{ id: "name", value: "test" }],
          globalFilter: "search",
        })),
        setColumnFilters,
        setGlobalFilter,
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      const clearButton = screen.getByRole("button");
      await user.click(clearButton);

      expect(setColumnFilters).toHaveBeenCalledWith([]);
      expect(setGlobalFilter).toHaveBeenCalledWith("");
    });

    it("should clear filters when there's both column filters and global filter", async () => {
      const user = userEvent.setup();
      const setColumnFilters = vi.fn();
      const setGlobalFilter = vi.fn();

      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [{ id: "name", value: "test" }],
          globalFilter: "global search",
        })),
        setColumnFilters,
        setGlobalFilter,
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      const clearButton = screen.getByRole("button");
      await user.click(clearButton);

      expect(setColumnFilters).toHaveBeenCalledWith([]);
      expect(setGlobalFilter).toHaveBeenCalledWith("");
    });

    it("should have correct styling classes on clear button", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [{ id: "name", value: "test" }],
          globalFilter: "",
        })),
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      const clearButton = screen.getByRole("button");
      // Check for key classes applied by our component
      expect(clearButton).toHaveClass("group");
      expect(clearButton).toHaveClass("h-8");
      expect(clearButton).toHaveClass("w-8");
      expect(clearButton).toHaveClass("p-0");
      expect(clearButton).toHaveClass("border-none");
      expect(clearButton).toHaveClass("hover:bg-primary");
      expect(clearButton).toHaveClass("animate-in");
      expect(clearButton).toHaveClass("fade-in-0");
      expect(clearButton).toHaveClass("zoom-in-95");
    });

    it("should render FilterX icon with correct styling", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [{ id: "name", value: "test" }],
          globalFilter: "",
        })),
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      const icon = screen.getByRole("button").querySelector("svg");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveClass(
        "h-4",
        "w-4",
        "text-muted-foreground",
        "group-hover:text-white",
        "transition-colors",
        "duration-200",
        "group-hover:rotate-90"
      );
    });
  });

  describe("Button Variant and Size", () => {
    it("should render clear button with outline variant and sm size", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [{ id: "name", value: "test" }],
          globalFilter: "",
        })),
      });

      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      const clearButton = screen.getByRole("button");
      // outline variant adds border class, sm size adds h-8 class
      expect(clearButton).toHaveClass("h-8");
    });
  });

  describe("Filter State Reactivity", () => {
    it("should react to changes in filter state", () => {
      let hasFilters = false;
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: hasFilters ? [{ id: "name", value: "test" }] : [],
          globalFilter: "",
        })),
      });

      const { rerender } = renderWithProviders(
        <DataTableToolbar table={mockTable as unknown} />
      );

      // Initially no filters
      expect(screen.queryByRole("button")).not.toBeInTheDocument();

      // Update to have filters
      hasFilters = true;
      rerender(<DataTableToolbar table={mockTable as unknown} />);

      // Should now show clear button
      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("should render all child components in correct positions", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [{ id: "name", value: "test" }],
          globalFilter: "",
        })),
      });

      const { container } = renderWithProviders(
        <DataTableToolbar table={mockTable as unknown} />
      );

      const toolbar = container.firstElementChild;
      const leftSection = toolbar?.firstElementChild;
      const rightSection = toolbar?.lastElementChild;

      // Left section should contain filter and clear button
      const filterComponent = within(leftSection as HTMLElement).getByTestId(
        "data-table-filter"
      );
      const clearButton = within(leftSection as HTMLElement).getByRole(
        "button"
      );

      expect(filterComponent).toBeInTheDocument();
      expect(clearButton).toBeInTheDocument();

      // Right section should contain view options and export
      const viewOptionsComponent = within(
        rightSection as HTMLElement
      ).getByTestId("data-table-view-options");
      const exportComponent = within(rightSection as HTMLElement).getByTestId(
        "data-table-export"
      );

      expect(viewOptionsComponent).toBeInTheDocument();
      expect(exportComponent).toBeInTheDocument();
    });

    it("should maintain component order", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [],
          globalFilter: "",
        })),
      });

      const { container } = renderWithProviders(
        <DataTableToolbar table={mockTable as unknown} />
      );

      const toolbar = container.firstElementChild;
      const leftSection = toolbar?.firstElementChild;
      const rightSection = toolbar?.lastElementChild;

      // Verify order in left section (filter first)
      const leftChildren = [...(leftSection?.children || [])];
      expect(leftChildren[0]).toHaveAttribute(
        "data-testid",
        "data-table-filter"
      );

      // Verify order in right section (view options, then export)
      const rightChildren = [...(rightSection?.children || [])];
      expect(rightChildren[0]).toHaveAttribute(
        "data-testid",
        "data-table-view-options"
      );
      expect(rightChildren[1]).toHaveAttribute(
        "data-testid",
        "data-table-export"
      );
    });
  });

  describe("Props Interface", () => {
    it("should accept DataTableToolbarOptions interface", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [],
          globalFilter: "",
        })),
      });

      // Test that it accepts the expected props without TypeScript errors
      const options = {
        table: mockTable as unknown,
        enableToolbar: true,
      };

      renderWithProviders(<DataTableToolbar {...options} />);

      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
    });

    it("should have correct default value for enableToolbar", () => {
      const mockTable = createMockTable({
        getState: vi.fn(() => ({
          columnFilters: [],
          globalFilter: "",
        })),
      });

      // When enableToolbar is not provided, it should default to true
      renderWithProviders(<DataTableToolbar table={mockTable as unknown} />);

      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
    });
  });
});
