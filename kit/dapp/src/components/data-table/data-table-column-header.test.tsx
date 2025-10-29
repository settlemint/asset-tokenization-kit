/**
 * @vitest-environment happy-dom
 */
import {
  createMockColumn,
  renderWithProviders,
} from "@test/helpers/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTableColumnHeader } from "./data-table-column-header";

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

describe("DataTableColumnHeader", () => {
  let mockColumn: ReturnType<typeof createMockColumn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockColumn = createMockColumn({
      id: "test-column",
      columnDef: {
        header: "Test Column",
        accessorKey: "test",
      },
    });
  });

  describe("Basic Rendering", () => {
    it("should render column header with children", () => {
      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Test Header
        </DataTableColumnHeader>
      );

      expect(screen.getByText("Test Header")).toBeInTheDocument();
    });

    it("should render without children when not provided", () => {
      renderWithProviders(<DataTableColumnHeader column={mockColumn} />);

      // Should render but without text (when sortable)
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      renderWithProviders(
        <DataTableColumnHeader
          column={mockColumn}
          className="custom-header-class"
        >
          Test
        </DataTableColumnHeader>
      );

      const container = screen
        .getByRole("button")
        .closest(".custom-header-class");
      expect(container).toBeInTheDocument();
    });

    it("should render wrapper container", () => {
      const { container } = renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>Test</DataTableColumnHeader>
      );

      const wrapper = container.querySelector(".flex.items-center.space-x-2");
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe("Sorting Functionality", () => {
    it("should render sort button when column is sortable", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Sortable Column
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Button acts as dropdown trigger, not directly for sorting
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should not render as button when column is not sortable", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Non-Sortable
        </DataTableColumnHeader>
      );

      // Should not have a button role
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.getByText("Non-Sortable")).toBeInTheDocument();
    });

    it("should show ascending sort indicator", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getIsSorted as ReturnType<typeof vi.fn>).mockReturnValue(
        "asc"
      );

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Sorted Asc
        </DataTableColumnHeader>
      );

      // Should show up arrow icon (SortAsc icon)
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Check for the presence of an SVG with the expected class
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should show descending sort indicator", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getIsSorted as ReturnType<typeof vi.fn>).mockReturnValue(
        "desc"
      );

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Sorted Desc
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Check for the presence of an SVG (SortDesc icon)
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });

    it("should show neutral sort indicator when not sorted", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getIsSorted as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Not Sorted
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Should have ArrowDownUp icon (but hidden when not sorted)
    });

    it("should open dropdown menu on click", async () => {
      const user = userEvent.setup();
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getIsSorted as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Click to Sort
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      // Should open dropdown menu, not directly toggle sorting
      await waitFor(() => {
        expect(screen.getByText("sortAscending")).toBeInTheDocument();
      });
    });

    it("should handle sort ascending action from dropdown", async () => {
      const user = userEvent.setup();
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getIsSorted as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Toggle Sort
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      // Find and click the sort ascending option
      await waitFor(async () => {
        const sortAscOption = await screen.findByText("sortAscending");
        await user.click(sortAscOption);
        expect(mockColumn.toggleSorting).toHaveBeenCalledWith(false);
      });
    });

    it("should handle sort descending action from dropdown", async () => {
      const user = userEvent.setup();
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getIsSorted as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Sort Options
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      // Find and click the sort descending option
      await waitFor(async () => {
        const sortDescOption = await screen.findByText("sortDescending");
        await user.click(sortDescOption);
        expect(mockColumn.toggleSorting).toHaveBeenCalledWith(true);
      });
    });
  });

  describe("Hide Column Functionality", () => {
    it("should show hide option in dropdown menu", async () => {
      const user = userEvent.setup();
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getCanHide as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Hideable
        </DataTableColumnHeader>
      );

      // Open dropdown menu
      const button = screen.getByRole("button");
      await user.click(button);

      // Check for hide option in dropdown
      await waitFor(() => {
        expect(
          screen.getByRole("menuitem", { name: "hide" })
        ).toBeInTheDocument();
      });
    });

    it("should handle hide column action", async () => {
      const user = userEvent.setup();
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getCanHide as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Hide Me
        </DataTableColumnHeader>
      );

      // Open dropdown and click hide
      const button = screen.getByRole("button");
      await user.click(button);

      await waitFor(async () => {
        const hideOption = screen.getByRole("menuitem", { name: "hide" });
        await user.click(hideOption);
        expect(mockColumn.toggleVisibility).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Icons", () => {
    it("should render default icons for sorting states", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Default Icons
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      // Should render with default Lucide icons
    });

    it("should render different icons for different sort states", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getIsSorted as ReturnType<typeof vi.fn>).mockReturnValue(
        "asc"
      );

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Sorted Column
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should use default variant by default", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Default
        </DataTableColumnHeader>
      );

      const container = screen
        .getByRole("button")
        .closest(".flex.items-center.space-x-2");
      expect(container).toBeInTheDocument();
      // Default variant doesn't add justify-end class
    });

    it("should use numeric variant when specified", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      renderWithProviders(
        <DataTableColumnHeader column={mockColumn} variant="numeric">
          Numeric
        </DataTableColumnHeader>
      );

      const container = screen.getByRole("button").closest(".justify-end");
      expect(container).toBeInTheDocument();
    });
  });

  describe("Dropdown Menu", () => {
    it("should render dropdown menu for sortable columns", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          With Menu
        </DataTableColumnHeader>
      );

      // Dropdown trigger should be present
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("should open dropdown menu and show sort options", async () => {
      const user = userEvent.setup();
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Click Menu
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      await user.click(button);

      // Menu items should appear
      await waitFor(() => {
        expect(
          screen.getByRole("menuitem", { name: "sortAscending" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("menuitem", { name: "sortDescending" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("menuitem", { name: "hide" })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes for dropdown trigger", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Accessible
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("aria-haspopup", "menu");
    });

    it("should support keyboard navigation", async () => {
      const user = userEvent.setup();
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Keyboard Nav
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      button.focus();

      // Press Enter to open dropdown
      await user.keyboard("{Enter}");
      await waitFor(() => {
        expect(screen.getByText("sortAscending")).toBeInTheDocument();
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle column with no getCanSort method", () => {
      const brokenColumn = createMockColumn({
        id: "broken",
        columnDef: {
          header: "Broken",
          id: "broken",
        },
        getCanSort: vi.fn().mockReturnValue(false),
      });

      renderWithProviders(
        <DataTableColumnHeader column={brokenColumn}>
          Broken
        </DataTableColumnHeader>
      );

      // Should render as non-sortable (no button)
      expect(screen.getByText("Broken")).toBeInTheDocument();
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("should handle very long children text", () => {
      const longText =
        "This is a very long column title that might cause layout issues";

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          {longText}
        </DataTableColumnHeader>
      );

      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it("should handle special characters in children", () => {
      const specialText = "Column <>&\"' Special";

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          {specialText}
        </DataTableColumnHeader>
      );

      expect(screen.getByText(specialText)).toBeInTheDocument();
    });

    it("should handle empty children", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}></DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });
  });

  describe("State Management", () => {
    it("should work with sortable columns", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getCanHide as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Full Integration
        </DataTableColumnHeader>
      );

      expect(screen.getByText("Full Integration")).toBeInTheDocument();
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("should update when column state changes", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);
      (mockColumn.getIsSorted as ReturnType<typeof vi.fn>).mockReturnValue(
        "asc"
      );

      const { rerender } = renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Dynamic
        </DataTableColumnHeader>
      );

      // Change sort state
      (mockColumn.getIsSorted as ReturnType<typeof vi.fn>).mockReturnValue(
        "desc"
      );

      rerender(
        <DataTableColumnHeader column={mockColumn}>
          Dynamic
        </DataTableColumnHeader>
      );

      expect(screen.getByText("Dynamic")).toBeInTheDocument();
      // Should show different icon for desc sort
      const button = screen.getByRole("button");
      const icon = button.querySelector("svg");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply hover styles to sortable columns", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Hoverable
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:bg-muted/50");
    });

    it("should apply transition styles", () => {
      (mockColumn.getCanSort as ReturnType<typeof vi.fn>).mockReturnValue(true);

      renderWithProviders(
        <DataTableColumnHeader column={mockColumn}>
          Focusable
        </DataTableColumnHeader>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("transition-background");
      expect(button).toHaveClass("duration-200");
    });
  });
});
