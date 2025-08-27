/**
 * @vitest-environment happy-dom
 */
import { Command, CommandGroup, CommandList } from "@/components/ui/command";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createMockColumn,
  createMockTable,
  renderWithProviders,
} from "@test/helpers/test-utils";
import { useIsMobile } from "../../hooks/use-mobile";
import { useScrollBlur } from "../../hooks/use-scroll-blur";
import {
  DataTableFilter,
  DataTableFilterDesktopContainer,
  DataTableFilterMobileContainer,
  PropertyFilterList,
  TableFilter,
  TableFilterMenuItem,
} from "./data-table-filter";

// Mock child components that have complex implementations
vi.mock("./filters/operators/operator-controller", () => ({
  PropertyFilterOperatorController: ({
    columnMeta,
    filter,
  }: {
    columnMeta: Record<string, unknown>;
    filter: Record<string, unknown>;
  }) => (
    <div data-testid="property-filter-operator">
      Operator: {columnMeta?.type as string} - {JSON.stringify(filter)}
    </div>
  ),
}));

vi.mock("./filters/property-filter-subject", () => ({
  PropertyFilterSubject: ({ meta }: { meta: Record<string, unknown> }) => (
    <div data-testid="property-filter-subject">
      Subject: {(meta?.displayName as string) || (meta?.type as string)}
    </div>
  ),
}));

vi.mock("./filters/values/value-controller", () => ({
  PropertyFilterValueController: ({
    id,
    columnMeta,
  }: {
    id: string;
    columnMeta: Record<string, unknown>;
  }) => (
    <div data-testid="property-filter-value">
      Value: {id} - {columnMeta?.type as string}
    </div>
  ),
}));

vi.mock("./filters/values/value-menu", () => ({
  PropertyFilterValueMenu: ({
    id,
    onBack,
  }: {
    id: string;
    onBack: () => void;
  }) => (
    <div data-testid="property-filter-value-menu">
      <button
        onClick={onBack as React.MouseEventHandler}
        data-testid="back-button"
      >
        Back
      </button>
      <div>Value Menu for {id}</div>
    </div>
  ),
}));

vi.mock("./filters/utils/table-helpers", () => ({
  getColumn: vi.fn((table, id) => table.getColumn(id)),
  getColumnMeta: vi.fn((table, id) => {
    const column = table.getColumn(id);
    return column?.columnDef?.meta || { type: "text", displayName: id };
  }),
}));

// Mock hooks
vi.mock("../../hooks/use-mobile", () => ({
  useIsMobile: vi.fn(() => false),
}));

vi.mock("../../hooks/use-scroll-blur", () => ({
  useScrollBlur: vi.fn(() => ({
    showLeftBlur: false,
    showRightBlur: false,
    checkScroll: vi.fn(),
  })),
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

describe("DataTableFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to desktop mode
    vi.mocked(useIsMobile).mockReturnValue(false);
  });

  describe("Component Layout and Responsive Behavior", () => {
    it("should render desktop layout when isMobile is false", () => {
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: { header: "Name" },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
      });

      const { container } = renderWithProviders(
        <DataTableFilter table={mockTable} />
      );

      // Should contain desktop container
      expect(
        container.querySelector(".relative.flex-1.overflow-hidden")
      ).toBeInTheDocument();
    });

    it("should render mobile layout when isMobile is true", () => {
      vi.mocked(useIsMobile).mockReturnValue(true);

      const mockColumn = createMockColumn({
        id: "name",
        columnDef: { header: "Name" },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
      });

      const { container } = renderWithProviders(
        <DataTableFilter table={mockTable} />
      );

      // Should contain mobile container
      expect(
        container.querySelector(".relative.w-full.overflow-x-hidden")
      ).toBeInTheDocument();
    });

    it("should re-render when filter count changes", () => {
      let filterCount = 0;

      const mockColumn = createMockColumn({
        id: "name",
        columnDef: { header: "Name" },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: Array.from({ length: filterCount }, (_, i) => ({
          id: `filter-test-${i}`,
          value: `test-${i}`,
        })),
      });

      const { rerender } = renderWithProviders(
        <DataTableFilter table={mockTable} />
      );

      // Change filter count and rerender
      filterCount = 2;
      rerender(<DataTableFilter table={mockTable} />);

      // Component should handle the change (no crash)
      expect(
        screen.getByRole("button", { name: /filter/i })
      ).toBeInTheDocument();
    });
  });

  describe("TableFilter Component", () => {
    it("should render filter button when filterable columns exist", () => {
      const mockColumn1 = createMockColumn({
        id: "name",
        columnDef: { header: "Name" },
      });
      const mockColumn2 = createMockColumn({
        id: "email",
        columnDef: { header: "Email" },
      });
      (mockColumn1.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );
      (mockColumn2.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn1, mockColumn2]),
      });

      renderWithProviders(<TableFilter table={mockTable} />);

      const filterButton = screen.getByRole("button", { name: /filter/i });
      expect(filterButton).toBeInTheDocument();
      expect(filterButton).toHaveClass(
        "h-8",
        "w-fit",
        "px-2",
        "text-muted-foreground"
      );
    });

    it("should return null when no filterable columns exist", () => {
      const mockColumn1 = createMockColumn({
        id: "name",
        columnDef: { header: "Name" },
      });
      const mockColumn2 = createMockColumn({
        id: "email",
        columnDef: { header: "Email" },
      });
      (mockColumn1.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );
      (mockColumn2.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn1, mockColumn2]),
      });

      const { container } = renderWithProviders(
        <TableFilter table={mockTable} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should show filter text on desktop", () => {
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: { header: "Name" },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
      });

      renderWithProviders(<TableFilter table={mockTable} />);

      expect(screen.getByText("filter")).toBeInTheDocument();
      expect(screen.getByText("filter")).toHaveClass("hidden", "md:block");
    });

    it("should prevent event propagation on button click", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { displayName: "Name", type: "text" },
        },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
      });

      const handleClick = vi.fn();
      renderWithProviders(
        <div onClick={handleClick}>
          <TableFilter table={mockTable} />
        </div>
      );

      const filterButton = screen.getByRole("button", { name: /filter/i });
      await user.click(filterButton);

      // Parent onClick should not be called due to stopPropagation
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should open popover when filter button is clicked", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { displayName: "Name", type: "text" },
        },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
      });

      renderWithProviders(<TableFilter table={mockTable} />);

      const filterButton = screen.getByRole("button", { name: /filter/i });
      await user.click(filterButton);

      // Should show command input for searching columns
      expect(screen.getByPlaceholderText("search")).toBeInTheDocument();
    });

    it("should display available filterable columns in popover", async () => {
      const user = userEvent.setup();
      const mockColumn1 = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { displayName: "Name", type: "text" },
        },
      });
      const mockColumn2 = createMockColumn({
        id: "email",
        columnDef: {
          header: "Email",
          meta: { displayName: "Email", type: "text" },
        },
      });
      (mockColumn1.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );
      (mockColumn2.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn1, mockColumn2]),
      });

      renderWithProviders(<TableFilter table={mockTable} />);

      const filterButton = screen.getByRole("button", { name: /filter/i });
      await user.click(filterButton);

      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Email")).toBeInTheDocument();
    });

    it("should filter columns based on search input", async () => {
      const user = userEvent.setup();
      const mockColumn1 = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { displayName: "Name", type: "text" },
        },
      });
      const mockColumn2 = createMockColumn({
        id: "email",
        columnDef: {
          header: "Email Address",
          meta: { displayName: "Email Address", type: "text" },
        },
      });
      (mockColumn1.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );
      (mockColumn2.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn1, mockColumn2]),
      });

      renderWithProviders(<TableFilter table={mockTable} />);

      const filterButton = screen.getByRole("button", { name: /filter/i });
      await user.click(filterButton);

      const searchInput = screen.getByPlaceholderText("search");
      await user.type(searchInput, "email");

      // Should show filtered results (command component handles this internally)
      expect(searchInput).toHaveValue("email");
    });

    it("should show no results message when search has no matches", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { displayName: "Name", type: "text" },
        },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
      });

      renderWithProviders(<TableFilter table={mockTable} />);

      const filterButton = screen.getByRole("button", { name: /filter/i });
      await user.click(filterButton);

      const searchInput = screen.getByPlaceholderText("search");
      await user.type(searchInput, "nonexistentcolumn");

      expect(screen.getByText("noResults")).toBeInTheDocument();
    });

    it("should clear search value when popover closes", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { displayName: "Name", type: "text" },
        },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
      });

      renderWithProviders(<TableFilter table={mockTable} />);

      const filterButton = screen.getByRole("button", { name: /filter/i });
      await user.click(filterButton);

      const searchInput = screen.getByPlaceholderText("search");
      await user.type(searchInput, "test");

      // Close popover by clicking outside or pressing escape
      await user.keyboard("{Escape}");

      // Reopen popover
      await user.click(filterButton);
      const newSearchInput = screen.getByPlaceholderText("search");
      expect(newSearchInput).toHaveValue("");
    });
  });

  describe("TableFilterMenuItem Component", () => {
    it("should render column display name", () => {
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Full Name",
          meta: { displayName: "Full Name", type: "text" },
        },
      });
      const setProperty = vi.fn();

      renderWithProviders(
        <Command>
          <CommandList>
            <CommandGroup>
              <TableFilterMenuItem
                column={mockColumn}
                setProperty={setProperty}
              />
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByText("Full Name")).toBeInTheDocument();
    });

    it("should render column id when no display name", () => {
      const mockColumn = createMockColumn({
        id: "email",
        columnDef: {
          header: "Email",
          meta: { type: "text" },
        },
      });
      const setProperty = vi.fn();

      renderWithProviders(
        <Command>
          <CommandList>
            <CommandGroup>
              <TableFilterMenuItem
                column={mockColumn}
                setProperty={setProperty}
              />
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByText("email")).toBeInTheDocument();
    });

    it("should render column icon when available", () => {
      const MockIcon = ({ className }: { className?: string }) => (
        <span className={className} data-testid="column-icon">
          Icon
        </span>
      );

      const mockColumn = createMockColumn({
        id: "status",
        columnDef: {
          header: "Status",
          meta: {
            displayName: "Status",
            type: "text",
            icon: MockIcon,
          },
        },
      });
      const setProperty = vi.fn();

      renderWithProviders(
        <Command>
          <CommandList>
            <CommandGroup>
              <TableFilterMenuItem
                column={mockColumn}
                setProperty={setProperty}
              />
            </CommandGroup>
          </CommandList>
        </Command>
      );

      expect(screen.getByTestId("column-icon")).toBeInTheDocument();
      expect(screen.getByTestId("column-icon")).toHaveClass("size-4");
    });

    it("should call setProperty when selected", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { displayName: "Name", type: "text" },
        },
      });
      const setProperty = vi.fn();

      renderWithProviders(
        <Command>
          <CommandList>
            <CommandGroup>
              <TableFilterMenuItem
                column={mockColumn}
                setProperty={setProperty}
              />
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const menuItem = screen.getByText("Name");
      await user.click(menuItem);

      expect(setProperty).toHaveBeenCalledWith("name");
    });

    it("should show arrow icon with correct visibility classes", () => {
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { displayName: "Name", type: "text" },
        },
      });
      const setProperty = vi.fn();

      const { container } = renderWithProviders(
        <Command>
          <CommandList>
            <CommandGroup>
              <TableFilterMenuItem
                column={mockColumn}
                setProperty={setProperty}
              />
            </CommandGroup>
          </CommandList>
        </Command>
      );

      const arrowIcon = container.querySelector("svg");
      expect(arrowIcon).toBeInTheDocument();
      expect(arrowIcon).toHaveClass(
        "size-4",
        "opacity-0",
        "group-aria-selected:opacity-100"
      );
    });
  });

  describe("PropertyFilterList Component", () => {
    it("should render filter chips for active filters", () => {
      const mockColumn1 = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { type: "text", displayName: "name" },
        },
      });
      const mockColumn2 = createMockColumn({
        id: "status",
        columnDef: {
          header: "Status",
          meta: { type: "text", displayName: "status" },
        },
      });

      const mockTable = createMockTable({
        getColumn: vi.fn((id) => {
          if (id === "name") return mockColumn1;
          if (id === "status") return mockColumn2;
          return undefined;
        }),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: [
          { id: "name", value: { operator: "contains", value: "test" } },
          { id: "status", value: { operator: "equals", value: "active" } },
        ],
      });

      renderWithProviders(<PropertyFilterList table={mockTable} />);

      expect(screen.getAllByTestId("property-filter-subject")).toHaveLength(2);
      expect(screen.getAllByTestId("property-filter-operator")).toHaveLength(2);
      expect(screen.getAllByTestId("property-filter-value")).toHaveLength(2);
    });

    it("should not render chips for filters without values", () => {
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { type: "text", displayName: "name" },
        },
      });

      const mockTable = createMockTable({
        getColumn: vi.fn(() => mockColumn),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: [
          { id: "name", value: null },
          { id: "status", value: undefined },
        ],
      });

      const { container } = renderWithProviders(
        <PropertyFilterList table={mockTable} />
      );

      expect(
        container.querySelector('[data-testid="property-filter-subject"]')
      ).not.toBeInTheDocument();
    });

    it("should handle different filter types correctly", () => {
      const types: Record<
        string,
        "text" | "number" | "date" | "option" | "multiOption"
      > = {
        name: "text",
        age: "number",
        date: "date",
        status: "option",
        tags: "multiOption",
      };

      const columns: Record<string, ReturnType<typeof createMockColumn>> = {};
      Object.entries(types).forEach(([id, columnType]) => {
        columns[id] = createMockColumn({
          id,
          columnDef: {
            header: id,
            meta: { type: columnType, displayName: id },
          },
        });
      });

      const mockTable = createMockTable({
        getColumn: vi.fn((id) => columns[id]),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: [
          { id: "name", value: { operator: "contains", value: "test" } },
          { id: "age", value: { operator: "gte", value: 18 } },
          {
            id: "date",
            value: {
              operator: "between",
              value: ["2024-01-01", "2024-12-31"],
            },
          },
          { id: "status", value: { operator: "in", value: ["active"] } },
          { id: "tags", value: { operator: "in", value: ["tag1", "tag2"] } },
        ],
      });

      renderWithProviders(<PropertyFilterList table={mockTable} />);

      // Should render multiple filter chips
      const filterSubjects = screen.getAllByTestId("property-filter-subject");
      expect(filterSubjects).toHaveLength(5);
    });

    it("should remove filter when remove button is clicked", async () => {
      const user = userEvent.setup();
      const setFilterValue = vi.fn();
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { type: "text", displayName: "name" },
        },
      });
      mockColumn.setFilterValue = setFilterValue;

      const mockTable = createMockTable({
        getColumn: vi.fn(() => mockColumn),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: [
          { id: "name", value: { operator: "contains", value: "test" } },
        ],
      });

      renderWithProviders(<PropertyFilterList table={mockTable} />);

      const removeButton = screen
        .getAllByRole("button")
        .find((btn) => btn.querySelector("svg"))!;
      await user.click(removeButton);

      expect(setFilterValue).toHaveBeenCalledWith(undefined);
    });

    it("should prevent event propagation on filter chip click", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { type: "text", displayName: "name" },
        },
      });

      const mockTable = createMockTable({
        getColumn: vi.fn(() => mockColumn),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: [
          { id: "name", value: { operator: "contains", value: "test" } },
        ],
      });

      const handleClick = vi.fn();
      renderWithProviders(
        <div onClick={handleClick}>
          <PropertyFilterList table={mockTable} />
        </div>
      );

      const filterChip = screen
        .getByTestId("property-filter-subject")
        .closest("div");
      await user.click(filterChip!);

      // Parent onClick should not be called due to stopPropagation
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should prevent event propagation on remove button click", async () => {
      const user = userEvent.setup();
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { type: "text", displayName: "name" },
        },
      });

      const mockTable = createMockTable({
        getColumn: vi.fn(() => mockColumn),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: [
          { id: "name", value: { operator: "contains", value: "test" } },
        ],
      });

      const handleClick = vi.fn();
      renderWithProviders(
        <div onClick={handleClick}>
          <PropertyFilterList table={mockTable} />
        </div>
      );

      const removeButton = screen
        .getAllByRole("button")
        .find((btn) => btn.querySelector("svg"))!;
      await user.click(removeButton);

      // Parent onClick should not be called due to stopPropagation
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("should re-render when filter count changes", () => {
      let filterCount = 1;
      const mockColumns: Record<
        string,
        ReturnType<typeof createMockColumn>
      > = {};

      // Create mock columns for each potential filter
      for (let i = 0; i < 3; i++) {
        mockColumns[`filter-name-${i}`] = createMockColumn({
          id: `filter-name-${i}`,
          columnDef: {
            header: `Filter ${i}`,
            meta: { type: "text", displayName: `filter-name-${i}` },
          },
        });
      }

      const mockTable = createMockTable({
        getColumn: vi.fn((id: string) => mockColumns[id]),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: Array.from({ length: filterCount }, (_, i) => ({
          id: `filter-name-${i}`,
          value: { operator: "contains", value: `test-${i}` },
        })),
      });

      const { rerender } = renderWithProviders(
        <PropertyFilterList table={mockTable} />
      );

      expect(screen.getByTestId("property-filter-subject")).toBeInTheDocument();

      // Change filter count
      filterCount = 2;

      // Update the mock state for the rerender
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: Array.from({ length: filterCount }, (_, i) => ({
          id: `filter-name-${i}`,
          value: { operator: "contains", value: `test-${i}` },
        })),
      });

      rerender(<PropertyFilterList table={mockTable} />);

      // Should still render without crashing
      expect(
        screen.getAllByTestId("property-filter-subject")[0]
      ).toBeInTheDocument();
    });
  });

  describe("DataTableFilterDesktopContainer", () => {
    it("should render children in scrollable container", () => {
      renderWithProviders(
        <DataTableFilterDesktopContainer>
          <div data-testid="child-content">Filter content</div>
        </DataTableFilterDesktopContainer>
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(
        screen
          .getByTestId("child-content")
          .closest(".flex.gap-2.overflow-x-auto.no-scrollbar")
      ).toBeInTheDocument();
    });

    it("should show blur effects when content is scrollable", () => {
      vi.mocked(useScrollBlur).mockReturnValue({
        showLeftBlur: true,
        showRightBlur: true,
        checkScroll: vi.fn(),
      });

      const { container } = renderWithProviders(
        <DataTableFilterDesktopContainer>
          <div>Content</div>
        </DataTableFilterDesktopContainer>
      );

      // Should show both blur gradients
      const leftBlur = container.querySelector(
        ".absolute.left-0.top-0.bottom-0.w-8"
      );
      const rightBlur = container.querySelector(
        ".absolute.right-0.top-0.bottom-0.w-8"
      );

      expect(leftBlur).toBeInTheDocument();
      expect(rightBlur).toBeInTheDocument();
    });

    it("should not show blur effects when not needed", () => {
      vi.mocked(useScrollBlur).mockReturnValue({
        showLeftBlur: false,
        showRightBlur: false,
        checkScroll: vi.fn(),
      });

      const { container } = renderWithProviders(
        <DataTableFilterDesktopContainer>
          <div>Content</div>
        </DataTableFilterDesktopContainer>
      );

      // Should not show blur gradients
      const leftBlur = container.querySelector(
        ".absolute.left-0.top-0.bottom-0.w-8"
      );
      const rightBlur = container.querySelector(
        ".absolute.right-0.top-0.bottom-0.w-8"
      );

      expect(leftBlur).not.toBeInTheDocument();
      expect(rightBlur).not.toBeInTheDocument();
    });

    it("should call checkScroll on scroll events", () => {
      const checkScroll = vi.fn();
      vi.mocked(useScrollBlur).mockReturnValue({
        showLeftBlur: false,
        showRightBlur: false,
        checkScroll,
      });

      const { container } = renderWithProviders(
        <DataTableFilterDesktopContainer>
          <div>Content</div>
        </DataTableFilterDesktopContainer>
      );

      const scrollContainer = container.querySelector(
        ".flex.gap-2.overflow-x-auto.no-scrollbar"
      );

      // Simulate scroll event
      scrollContainer?.dispatchEvent(new Event("scroll"));

      expect(checkScroll).toHaveBeenCalled();
    });

    it("should update blur effects when children change", () => {
      const checkScroll = vi.fn();
      vi.mocked(useScrollBlur).mockReturnValue({
        showLeftBlur: false,
        showRightBlur: false,
        checkScroll,
      });

      const { rerender } = renderWithProviders(
        <DataTableFilterDesktopContainer>
          <div>Initial content</div>
        </DataTableFilterDesktopContainer>
      );

      // Change children
      rerender(
        <DataTableFilterDesktopContainer>
          <div>Updated content</div>
          <div>More content</div>
        </DataTableFilterDesktopContainer>
      );

      expect(checkScroll).toHaveBeenCalled();
    });
  });

  describe("DataTableFilterMobileContainer", () => {
    it("should render children in mobile scrollable container", () => {
      renderWithProviders(
        <DataTableFilterMobileContainer>
          <div data-testid="mobile-content">Mobile filter content</div>
        </DataTableFilterMobileContainer>
      );

      expect(screen.getByTestId("mobile-content")).toBeInTheDocument();
      expect(
        screen
          .getByTestId("mobile-content")
          .closest(".flex.gap-2.overflow-x-scroll.no-scrollbar")
      ).toBeInTheDocument();
    });

    it("should show wider blur effects for mobile", () => {
      vi.mocked(useScrollBlur).mockReturnValue({
        showLeftBlur: true,
        showRightBlur: true,
        checkScroll: vi.fn(),
      });

      const { container } = renderWithProviders(
        <DataTableFilterMobileContainer>
          <div>Content</div>
        </DataTableFilterMobileContainer>
      );

      // Should show wider blur gradients (w-16 instead of w-8)
      const leftBlur = container.querySelector(
        ".absolute.left-0.top-0.bottom-0.w-16"
      );
      const rightBlur = container.querySelector(
        ".absolute.right-0.top-0.bottom-0.w-16"
      );

      expect(leftBlur).toBeInTheDocument();
      expect(rightBlur).toBeInTheDocument();
    });

    it("should have full width container", () => {
      const { container } = renderWithProviders(
        <DataTableFilterMobileContainer>
          <div>Content</div>
        </DataTableFilterMobileContainer>
      );

      const container_div = container.querySelector(
        ".relative.w-full.overflow-x-hidden"
      );
      expect(container_div).toBeInTheDocument();
    });

    it("should call checkScroll on mobile scroll events", () => {
      const checkScroll = vi.fn();
      vi.mocked(useScrollBlur).mockReturnValue({
        showLeftBlur: false,
        showRightBlur: false,
        checkScroll,
      });

      const { container } = renderWithProviders(
        <DataTableFilterMobileContainer>
          <div>Content</div>
        </DataTableFilterMobileContainer>
      );

      const scrollContainer = container.querySelector(
        ".flex.gap-2.overflow-x-scroll.no-scrollbar"
      );

      // Simulate scroll event
      scrollContainer?.dispatchEvent(new Event("scroll"));

      expect(checkScroll).toHaveBeenCalled();
    });
  });

  describe("Integration Tests", () => {
    it("should integrate all components in desktop mode", () => {
      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { type: "text", displayName: "name" },
        },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
        getColumn: vi.fn(() => mockColumn),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: [
          { id: "name", value: { operator: "contains", value: "test" } },
        ],
      });

      renderWithProviders(<DataTableFilter table={mockTable} />);

      // Should render filter button
      expect(
        screen.getByRole("button", { name: /filter/i })
      ).toBeInTheDocument();

      // Should render filter chips
      expect(screen.getByTestId("property-filter-subject")).toBeInTheDocument();
      expect(
        screen.getByTestId("property-filter-operator")
      ).toBeInTheDocument();
      expect(screen.getByTestId("property-filter-value")).toBeInTheDocument();
    });

    it("should integrate all components in mobile mode", () => {
      vi.mocked(useIsMobile).mockReturnValue(true);

      const mockColumn = createMockColumn({
        id: "name",
        columnDef: {
          header: "Name",
          meta: { type: "text", displayName: "name" },
        },
      });
      (mockColumn.getCanFilter as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => [mockColumn]),
        getColumn: vi.fn(() => mockColumn),
      });

      // Override getState after creating mockTable
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        ...createMockTable().getState(),
        columnFilters: [
          { id: "name", value: { operator: "contains", value: "test" } },
        ],
      });

      renderWithProviders(<DataTableFilter table={mockTable} />);

      // Should render filter button
      expect(
        screen.getByRole("button", { name: /filter/i })
      ).toBeInTheDocument();

      // Should render filter chips in mobile container
      expect(screen.getByTestId("property-filter-subject")).toBeInTheDocument();
    });

    it("should handle empty state correctly", () => {
      const mockTable = createMockTable({
        getAllColumns: vi.fn(() => []),
      });

      const { container } = renderWithProviders(
        <DataTableFilter table={mockTable} />
      );

      // Should only render the containers but no filter button (no filterable columns)
      expect(
        container.querySelector('[role="button"]')
      ).not.toBeInTheDocument();
    });
  });
});
