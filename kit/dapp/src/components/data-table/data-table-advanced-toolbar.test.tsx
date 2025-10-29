/**
 * @vitest-environment happy-dom
 */
import {
  createMockTable,
  overrideTableState,
  renderWithProviders,
} from "@test/helpers/test-utils";
import { screen, within } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTableAdvancedToolbar } from "./data-table-advanced-toolbar";

// Mock child components
vi.mock("./data-table-filter", () => ({
  DataTableFilter: () => (
    <div data-testid="data-table-filter">Filter Component</div>
  ),
}));

vi.mock("./data-table-view-options", () => ({
  DataTableViewOptions: () => (
    <div data-testid="data-table-view-options">View Options Component</div>
  ),
}));

vi.mock("./data-table-export", () => ({
  DataTableExport: () => (
    <div data-testid="data-table-export">Export Component</div>
  ),
}));

// Mock useIsMobile hook
vi.mock("../../hooks/use-mobile");

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

describe("DataTableAdvancedToolbar", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset to desktop mode
    const { useIsMobile } = await import("../../hooks/use-mobile");
    vi.mocked(useIsMobile).mockReturnValue(false);
  });

  describe("Component Rendering", () => {
    it("should render toolbar with all components when enabled", () => {
      const mockTable = createMockTable({
        setGlobalFilter: vi.fn(),
        setColumnFilters: vi.fn(),
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      // Check global search
      expect(screen.getByPlaceholderText("search")).toBeInTheDocument();

      // Check child components
      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-view-options")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-export")).toBeInTheDocument();
    });

    it("should return null when enableToolbar is false", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} enableToolbar={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render with custom placeholder text", () => {
      const mockTable = createMockTable();

      renderWithProviders(
        <DataTableAdvancedToolbar
          table={mockTable}
          placeholder="Custom search placeholder"
        />
      );

      expect(
        screen.getByPlaceholderText("Custom search placeholder")
      ).toBeInTheDocument();
    });

    it("should render with custom actions", () => {
      const mockTable = createMockTable();

      const customActions = (
        <button data-testid="custom-action">Custom Action</button>
      );

      renderWithProviders(
        <DataTableAdvancedToolbar
          table={mockTable}
          customActions={customActions}
        />
      );

      expect(screen.getByTestId("custom-action")).toBeInTheDocument();
    });
  });

  describe("Global Search Functionality", () => {
    it("should initialize search value from table state", () => {
      const mockTable = createMockTable();
      overrideTableState(mockTable, {
        globalFilter: "initial search",
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const searchInput = screen.getByDisplayValue("initial search");
      expect(searchInput).toBeInTheDocument();
    });

    it("should update global filter when typing in search input", async () => {
      const user = userEvent.setup();
      const setGlobalFilter = vi.fn();
      const mockTable = createMockTable({
        setGlobalFilter,
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const searchInput = screen.getByPlaceholderText("search");
      await user.type(searchInput, "test search");

      expect(setGlobalFilter).toHaveBeenCalledWith("test search");
    });

    it("should prevent event propagation on input click", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable();

      const handleClick = vi.fn();
      renderWithProviders(
        <div onClick={handleClick}>
          <DataTableAdvancedToolbar table={mockTable} />
        </div>
      );

      const searchInput = screen.getByPlaceholderText("search");
      await user.click(searchInput);

      // The parent onClick should not be called due to stopPropagation
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not render search input when enableGlobalSearch is false", () => {
      const mockTable = createMockTable();

      renderWithProviders(
        <DataTableAdvancedToolbar
          table={mockTable}
          enableGlobalSearch={false}
        />
      );

      expect(screen.queryByPlaceholderText("search")).not.toBeInTheDocument();
    });
  });

  describe("Filter Management", () => {
    it("should show clear all button when filters exist", () => {
      const mockTable = createMockTable();
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      expect(screen.getByText("clearAll")).toBeInTheDocument();
    });

    it("should show clear all button when global filter exists", () => {
      const mockTable = createMockTable();
      overrideTableState(mockTable, {
        globalFilter: "search term",
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      expect(screen.getByText("clearAll")).toBeInTheDocument();
    });

    it("should hide clear all button when no filters exist", () => {
      const mockTable = createMockTable();

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      expect(screen.queryByText("clearAll")).not.toBeInTheDocument();
    });

    it("should clear all filters when clear button is clicked", async () => {
      const user = userEvent.setup();
      const setColumnFilters = vi.fn();
      const setGlobalFilter = vi.fn();
      const mockTable = createMockTable({
        setColumnFilters,
        setGlobalFilter,
      });
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
        globalFilter: "search",
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const clearButton = screen.getByText("clearAll");
      await user.click(clearButton);

      expect(setColumnFilters).toHaveBeenCalledWith([]);
      expect(setGlobalFilter).toHaveBeenCalledWith("");
    });

    it("should clear search input when clear all filters is clicked", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        setColumnFilters: vi.fn(),
        setGlobalFilter: vi.fn(),
      });
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
        globalFilter: "initial search",
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const clearButton = screen.getByText("clearAll");
      await user.click(clearButton);

      const searchInput = screen.getByPlaceholderText("search");
      expect(searchInput).toHaveValue("");
    });

    it("should prevent event propagation on clear filters click", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable({
        setColumnFilters: vi.fn(),
        setGlobalFilter: vi.fn(),
      });
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
      });

      const handleClick = vi.fn();
      renderWithProviders(
        <div onClick={handleClick}>
          <DataTableAdvancedToolbar table={mockTable} />
        </div>
      );

      const clearButton = screen.getByText("clearAll");
      await user.click(clearButton);

      // The parent onClick should not be called due to stopPropagation
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should not render filter components when enableFilters is false", () => {
      const mockTable = createMockTable();
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} enableFilters={false} />
      );

      expect(screen.queryByTestId("data-table-filter")).not.toBeInTheDocument();
      expect(screen.queryByText("clearAll")).not.toBeInTheDocument();
    });
  });

  describe("Component Options", () => {
    it("should not render export component when enableExport is false", () => {
      const mockTable = createMockTable();

      renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} enableExport={false} />
      );

      expect(screen.queryByTestId("data-table-export")).not.toBeInTheDocument();
    });

    it("should not render view options when enableViewOptions is false", () => {
      const mockTable = createMockTable();

      renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} enableViewOptions={false} />
      );

      expect(
        screen.queryByTestId("data-table-view-options")
      ).not.toBeInTheDocument();
    });

    it("should render all components with default options", () => {
      const mockTable = createMockTable();

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-export")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-view-options")).toBeInTheDocument();
    });
  });

  describe("Mobile Layout", () => {
    beforeEach(async () => {
      const { useIsMobile } = await import("../../hooks/use-mobile");
      vi.mocked(useIsMobile).mockReturnValue(true);
    });

    it("should render mobile layout when isMobile is true", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} />
      );

      // Check for mobile-specific layout classes
      const mobileContainer = container.querySelector(".space-y-3");
      expect(mobileContainer).toBeInTheDocument();
    });

    it("should render search input with mobile styling", () => {
      const mockTable = createMockTable();

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const searchInput = screen.getByPlaceholderText("search");
      expect(searchInput).toHaveClass("pl-9", "h-9");
    });

    it("should render clear button with mobile styling", () => {
      const mockTable = createMockTable();
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const clearButton = screen.getByText("clearAll");
      expect(clearButton).toHaveClass("h-7", "text-xs", "ml-auto");
    });

    it("should group actions in flex-wrap container on mobile", () => {
      const mockTable = createMockTable();

      const customActions = <button data-testid="custom-action">Custom</button>;

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar
          table={mockTable}
          customActions={customActions}
        />
      );

      const actionsContainer = container.querySelector(
        ".flex.flex-wrap.items-center.gap-2"
      );
      expect(actionsContainer).toBeInTheDocument();

      // Check that custom actions and other components are in the same container
      const actionsSection = within(actionsContainer as HTMLElement);
      expect(actionsSection.getByTestId("custom-action")).toBeInTheDocument();
      expect(
        actionsSection.getByTestId("data-table-export")
      ).toBeInTheDocument();
      expect(
        actionsSection.getByTestId("data-table-view-options")
      ).toBeInTheDocument();
    });
  });

  describe("Desktop Layout", () => {
    it("should render desktop layout when isMobile is false", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} />
      );

      // Check for desktop-specific layout structure
      const desktopContainer = container.querySelector(".space-y-4");
      expect(desktopContainer).toBeInTheDocument();

      const flexContainer = container.querySelector(
        String.raw`.flex.flex-col.gap-4.lg\:flex-row.lg\:items-center.lg\:justify-between`
      );
      expect(flexContainer).toBeInTheDocument();
    });

    it("should render search input with desktop styling and max width", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} />
      );

      const searchContainer = container.querySelector(
        ".relative.w-full.max-w-sm"
      );
      expect(searchContainer).toBeInTheDocument();

      const searchInput = screen.getByPlaceholderText("search");
      expect(searchInput).toHaveClass("pl-9", "h-9", "bg-background");
    });

    it("should render separator between search and filters", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} />
      );

      // Look for separator with vertical orientation
      const separator = container.querySelector(
        '[data-orientation="vertical"]'
      );
      expect(separator).toBeInTheDocument();
    });

    it("should render clear button with desktop styling", () => {
      const mockTable = createMockTable();
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const clearButton = screen.getByText("clearAll");
      expect(clearButton).toHaveClass(
        "h-8",
        "gap-2",
        "text-muted-foreground",
        "hover:text-foreground"
      );
    });

    it("should render custom actions with separator in desktop layout", () => {
      const mockTable = createMockTable();

      const customActions = <button data-testid="custom-action">Custom</button>;

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar
          table={mockTable}
          customActions={customActions}
        />
      );

      expect(screen.getByTestId("custom-action")).toBeInTheDocument();

      // Should have separator after custom actions
      const separators = container.querySelectorAll(
        '[data-orientation="vertical"]'
      );
      expect(separators.length).toBeGreaterThan(1); // One for search/filters, one for custom actions
    });

    it("should not render separator when search is disabled", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar
          table={mockTable}
          enableGlobalSearch={false}
        />
      );

      // Should not have search/filter separator when search is disabled
      const separators = container.querySelectorAll(
        '[data-orientation="vertical"]'
      );
      expect(separators.length).toBe(0);
    });

    it("should not render separator when filters are disabled", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} enableFilters={false} />
      );

      // Should not have search/filter separator when filters are disabled
      const separators = container.querySelectorAll(
        '[data-orientation="vertical"]'
      );
      expect(separators.length).toBe(0);
    });
  });

  describe("Props Interface and TypeScript", () => {
    it("should accept DataTableAdvancedToolbarOptions interface", () => {
      const mockTable = createMockTable();

      const options = {
        table: mockTable,
        enableToolbar: true,
        enableGlobalSearch: true,
        enableFilters: true,
        enableExport: true,
        enableViewOptions: true,
        placeholder: "Custom placeholder",
        customActions: <button>Custom</button>,
      };

      renderWithProviders(<DataTableAdvancedToolbar {...options} />);

      expect(
        screen.getByPlaceholderText("Custom placeholder")
      ).toBeInTheDocument();
    });

    it("should have correct default values for optional props", () => {
      const mockTable = createMockTable();

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      // Verify default behaviors (all features enabled by default)
      expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-filter")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-export")).toBeInTheDocument();
      expect(screen.getByTestId("data-table-view-options")).toBeInTheDocument();
    });
  });

  describe("Search Icon Rendering", () => {
    it("should render search icon with correct styling", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <DataTableAdvancedToolbar table={mockTable} />
      );

      const searchIcon = container.querySelector("svg");
      expect(searchIcon).toBeInTheDocument();
      expect(searchIcon).toHaveClass(
        "absolute",
        "left-3",
        "top-1/2",
        "h-4",
        "w-4",
        "-translate-y-1/2",
        "text-muted-foreground"
      );
    });
  });

  describe("FilterX Icon in Clear Button", () => {
    it("should render FilterX icon in clear button with correct styling", () => {
      const mockTable = createMockTable();
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const clearButton = screen.getByText("clearAll");
      const filterIcon = clearButton.querySelector("svg");
      expect(filterIcon).toBeInTheDocument();
    });

    it("should render FilterX icon with mobile styling", async () => {
      const { useIsMobile } = await import("../../hooks/use-mobile");
      vi.mocked(useIsMobile).mockReturnValue(true);

      const mockTable = createMockTable();
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const clearButton = screen.getByText("clearAll");
      const filterIcon = clearButton.querySelector("svg");
      expect(filterIcon).toBeInTheDocument();
      expect(filterIcon).toHaveClass("h-3", "w-3");
    });

    it("should render FilterX icon with desktop styling", () => {
      const mockTable = createMockTable();
      overrideTableState(mockTable, {
        columnFilters: [{ id: "name", value: "test" }],
      });

      renderWithProviders(<DataTableAdvancedToolbar table={mockTable} />);

      const clearButton = screen.getByText("clearAll");
      const filterIcon = clearButton.querySelector("svg");
      expect(filterIcon).toBeInTheDocument();
      expect(filterIcon).toHaveClass("h-4", "w-4");
    });
  });
});
