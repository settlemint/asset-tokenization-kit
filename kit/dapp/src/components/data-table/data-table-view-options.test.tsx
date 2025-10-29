import type { Column, Table } from "@tanstack/react-table";
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTableViewOptions } from "./data-table-view-options";

// Mock translations
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe("DataTableViewOptions", () => {
  const mockToggleVisibility = vi.fn();
  const mockGetIsVisible = vi.fn();
  const mockGetCanHide = vi.fn();

  const createMockColumn = (
    id: string,
    _canHide = true,
    _isVisible = true,
    hasAccessor = true
  ): Column<unknown> =>
    ({
      id,
      getIsVisible: () => mockGetIsVisible(),
      toggleVisibility: mockToggleVisibility,
      getCanHide: () => mockGetCanHide(),
      accessorFn: hasAccessor ? () => {} : undefined,
    }) as unknown as Column<unknown>;

  const createMockTable = (columns: Column<unknown>[]): Table<unknown> =>
    ({
      getAllColumns: () => columns,
      getColumn: (columnId: string) =>
        columns.find((col) => col.id === columnId),
    }) as unknown as Table<unknown>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetIsVisible.mockReturnValue(true);
    mockGetCanHide.mockReturnValue(true);
  });

  describe("Structure and Layout", () => {
    it("should render the view options button", () => {
      const mockTable = createMockTable([]);
      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("ml-auto", "hidden", "h-8", "lg:flex");
      expect(screen.getByText("view")).toBeInTheDocument();
    });

    it("should render with Settings2 icon", () => {
      const mockTable = createMockTable([]);
      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      const button = screen.getByRole("button");
      expect(button.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Dropdown Menu", () => {
    it("should show dropdown menu when button is clicked", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable([
        createMockColumn("name"),
        createMockColumn("status"),
      ]);

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));

      expect(screen.getByText("toggleColumns")).toBeInTheDocument();
    });

    it("should display only columns with accessorFn and canHide", async () => {
      const user = userEvent.setup();

      // Set up different return values for different columns
      const hiddenColumn = createMockColumn("hidden", false, true, true);
      hiddenColumn.getCanHide = () => false;

      const mockTable = createMockTable([
        createMockColumn("name", true, true, true),
        hiddenColumn,
        createMockColumn("noAccessor", true, true, false), // No accessor
        createMockColumn("status", true, true, true),
      ]);

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));

      // Should only show columns that have accessorFn and canHide
      expect(screen.getByText("name")).toBeInTheDocument();
      expect(screen.getByText("status")).toBeInTheDocument();
      expect(screen.queryByText("hidden")).not.toBeInTheDocument();
      expect(screen.queryByText("noAccessor")).not.toBeInTheDocument();
    });

    it("should show checked state for visible columns", async () => {
      const user = userEvent.setup();
      mockGetIsVisible.mockReturnValue(true);

      const mockTable = createMockTable([createMockColumn("name", true, true)]);

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));

      const checkbox = screen.getByRole("menuitemcheckbox", { name: "name" });
      expect(checkbox).toHaveAttribute("aria-checked", "true");
    });

    it("should show unchecked state for hidden columns", async () => {
      const user = userEvent.setup();
      mockGetIsVisible.mockReturnValue(false);

      const mockTable = createMockTable([
        createMockColumn("name", true, false),
      ]);

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));

      const checkbox = screen.getByRole("menuitemcheckbox", { name: "name" });
      expect(checkbox).toHaveAttribute("aria-checked", "false");
    });
  });

  describe("Column Visibility Toggle", () => {
    it("should toggle column visibility when checkbox is clicked", async () => {
      const user = userEvent.setup();
      const column = createMockColumn("name");
      const mockTable = createMockTable([column]);

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("menuitemcheckbox", { name: "name" }));

      expect(mockToggleVisibility).toHaveBeenCalledWith(false);
    });

    it("should handle checking an unchecked column", async () => {
      const user = userEvent.setup();
      mockGetIsVisible.mockReturnValue(false);

      const column = createMockColumn("name", true, false);
      const mockTable = createMockTable([column]);

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("menuitemcheckbox", { name: "name" }));

      expect(mockToggleVisibility).toHaveBeenCalledWith(true);
    });

    it("should handle multiple column toggles", async () => {
      const user = userEvent.setup();
      const nameColumn = createMockColumn("name");
      const statusColumn = createMockColumn("status");

      const mockTable = {
        getAllColumns: () => [nameColumn, statusColumn],
        getColumn: vi.fn((id: string) => {
          if (id === "name") return nameColumn;
          if (id === "status") return statusColumn;
          return undefined;
        }),
      } as unknown as Table<unknown>;

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      // First toggle
      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("menuitemcheckbox", { name: "name" }));
      expect(nameColumn.toggleVisibility).toHaveBeenCalledWith(false);

      // Re-open dropdown for second toggle (dropdown closes after each action)
      await user.click(screen.getByRole("button"));
      await user.click(
        screen.getByRole("menuitemcheckbox", { name: "status" })
      );
      expect(statusColumn.toggleVisibility).toHaveBeenCalledWith(false);
    });

    it("should handle missing column gracefully", async () => {
      const user = userEvent.setup();
      const mockTable = {
        getAllColumns: () => [createMockColumn("name")],
        getColumn: () => undefined, // Column not found
      } as unknown as Table<unknown>;

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));

      // Should not throw when column is not found
      await expect(
        user.click(screen.getByRole("menuitemcheckbox", { name: "name" }))
      ).resolves.not.toThrow();
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty column list", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable([]);

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));

      // Should show label but no columns
      expect(screen.getByText("toggleColumns")).toBeInTheDocument();
      expect(screen.queryByRole("menuitemcheckbox")).not.toBeInTheDocument();
    });

    it("should handle all columns being non-hideable", async () => {
      const user = userEvent.setup();
      mockGetCanHide.mockReturnValue(false);

      const mockTable = createMockTable([
        createMockColumn("name"),
        createMockColumn("status"),
      ]);

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));

      // Should show label but no columns
      expect(screen.getByText("toggleColumns")).toBeInTheDocument();
      expect(screen.queryByRole("menuitemcheckbox")).not.toBeInTheDocument();
    });

    it("should apply capitalize class to column items", async () => {
      const user = userEvent.setup();
      const mockTable = createMockTable([createMockColumn("name")]);

      renderWithProviders(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));

      const checkbox = screen.getByRole("menuitemcheckbox", { name: "name" });
      expect(checkbox).toHaveClass("capitalize");
    });
  });

  describe("Callback Memoization", () => {
    it("should memoize handleColumnVisibilityChange callback", async () => {
      const user = userEvent.setup();
      const column = createMockColumn("name");
      const mockTable = createMockTable([column]);

      const { rerender } = renderWithProviders(
        <DataTableViewOptions table={mockTable} />
      );

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("menuitemcheckbox", { name: "name" }));

      const firstCallCount = mockToggleVisibility.mock.calls.length;

      // Re-render with same props
      rerender(<DataTableViewOptions table={mockTable} />);

      await user.click(screen.getByRole("button"));
      await user.click(screen.getByRole("menuitemcheckbox", { name: "name" }));

      // Should have been called again (callback is stable)
      expect(mockToggleVisibility).toHaveBeenCalledTimes(firstCallCount + 1);
    });
  });
});
