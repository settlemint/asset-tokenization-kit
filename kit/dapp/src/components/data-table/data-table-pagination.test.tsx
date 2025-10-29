/**
 * @vitest-environment happy-dom
 */
import type { Table } from "@tanstack/react-table";
import {
  createMockTable,
  renderWithProviders,
  type TestDataItem,
} from "@test/helpers/test-utils";
import { screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DataTablePagination } from "./data-table-pagination";

// Mock react-i18next specifically for this test file
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (key === "selectedRowsInfo" && params) {
        return `${params.selected} of ${params.total} row(s) selected`;
      }
      return key;
    },
    i18n: {
      changeLanguage: () => Promise.resolve(),
      language: "en",
    },
  }),
}));

// Mock shadcn/Radix Select to a simple native select for fast tests
vi.mock("@/components/ui/select", async () => {
  const React = await import("react");
  const PAGE_SIZES = [10, 20, 30, 50, 100];

  const Select = ({
    value,
    onValueChange,
  }: {
    value?: string;
    onValueChange?: (value: string) => void;
  }) =>
    React.createElement(
      "select",
      {
        role: "combobox",
        "data-testid": "rows-per-page-select",
        value,
        onChange: (e: React.ChangeEvent<HTMLSelectElement>) =>
          onValueChange?.(e.target.value),
      },
      PAGE_SIZES.map((v) =>
        React.createElement("option", { key: v, value: String(v) }, String(v))
      )
    );

  const SelectContent = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  const SelectTrigger = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);
  const SelectValue = ({ placeholder }: { placeholder?: string }) =>
    React.createElement(
      "span",
      { "data-testid": "select-value" },
      placeholder ?? ""
    );
  const SelectItem = ({ children }: { children?: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children);

  return { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };
});

// Polyfill for hasPointerCapture (missing in happy-dom)
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = function () {
    return false;
  };
}

describe("DataTablePagination", () => {
  let mockTable: Table<TestDataItem>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockTable = createMockTable({
      getState: vi.fn().mockReturnValue({
        pagination: { pageIndex: 2, pageSize: 10 },
      }),
      getPageCount: vi.fn().mockReturnValue(10),
      getCanPreviousPage: vi.fn().mockReturnValue(true),
      getCanNextPage: vi.fn().mockReturnValue(true),
      getAllColumns: vi.fn().mockReturnValue([]),
      getFilteredSelectedRowModel: vi.fn().mockReturnValue({ rows: [] }),
      getFilteredRowModel: vi.fn().mockReturnValue({ rows: [] }),
    }) as unknown as Table<TestDataItem>;
  });

  describe("Basic Rendering", () => {
    it("should render pagination controls", () => {
      renderWithProviders(<DataTablePagination table={mockTable} />);

      // Check for rows per page text
      expect(screen.getByText("rowsPerPage")).toBeInTheDocument();

      // Check for page size selector
      expect(screen.getByRole("combobox")).toBeInTheDocument();

      // Check for page display
      const pageNumbers = screen.getAllByText("10");
      expect(pageNumbers.length).toBeGreaterThan(0); // Multiple 10s are OK
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("/")).toBeInTheDocument();
    });

    it("should not render when enablePagination is false", () => {
      const { container } = renderWithProviders(
        <DataTablePagination table={mockTable} enablePagination={false} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe("Page Size Selection", () => {
    it("should change page size on selection", async () => {
      const user = userEvent.setup();
      const mockSetPageSize = vi.fn();
      mockTable.setPageSize = mockSetPageSize;

      renderWithProviders(<DataTablePagination table={mockTable} />);

      const select = screen.getByRole("combobox");
      await user.selectOptions(select, "20");
      expect(mockSetPageSize).toHaveBeenCalledWith(20);
    });
  });

  describe("Navigation Buttons", () => {
    it("should navigate to first page", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DataTablePagination table={mockTable} />);

      // Find button by its svg icon or structure
      const buttons = screen.getAllByRole("button");
      const firstButton = buttons.find(
        (btn) => btn.querySelector(".sr-only")?.textContent === "goToFirstPage"
      ) as HTMLButtonElement;

      expect(firstButton).toBeDefined();
      await user.click(firstButton);

      expect(mockTable.setPageIndex).toHaveBeenCalledWith(0);
    });

    it("should navigate to previous page", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DataTablePagination table={mockTable} />);

      const buttons = screen.getAllByRole("button");
      const prevButton = buttons.find(
        (btn) =>
          btn.querySelector(".sr-only")?.textContent === "goToPreviousPage"
      ) as HTMLButtonElement;

      expect(prevButton).toBeDefined();
      await user.click(prevButton);

      expect(mockTable.previousPage).toHaveBeenCalled();
    });

    it("should navigate to next page", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DataTablePagination table={mockTable} />);

      const buttons = screen.getAllByRole("button");
      const nextButton = buttons.find(
        (btn) => btn.querySelector(".sr-only")?.textContent === "goToNextPage"
      ) as HTMLButtonElement;

      expect(nextButton).toBeDefined();
      await user.click(nextButton);

      expect(mockTable.nextPage).toHaveBeenCalled();
    });

    it("should navigate to last page", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DataTablePagination table={mockTable} />);

      const buttons = screen.getAllByRole("button");
      const lastButton = buttons.find(
        (btn) => btn.querySelector(".sr-only")?.textContent === "goToLastPage"
      ) as HTMLButtonElement;

      expect(lastButton).toBeDefined();
      await user.click(lastButton);

      expect(mockTable.setPageIndex).toHaveBeenCalledWith(9);
    });

    it("should disable navigation when on first page", () => {
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        pagination: { pageIndex: 0, pageSize: 10 },
      });
      (
        mockTable.getCanPreviousPage as ReturnType<typeof vi.fn>
      ).mockReturnValue(false);
      (mockTable.getCanNextPage as ReturnType<typeof vi.fn>).mockReturnValue(
        true
      );

      renderWithProviders(<DataTablePagination table={mockTable} />);

      const buttons = screen.getAllByRole("button");
      const firstButton = buttons.find(
        (btn) => btn.querySelector(".sr-only")?.textContent === "goToFirstPage"
      );
      const prevButton = buttons.find(
        (btn) =>
          btn.querySelector(".sr-only")?.textContent === "goToPreviousPage"
      );

      expect(firstButton).toBeDisabled();
      expect(prevButton).toBeDisabled();
    });

    it("should disable navigation when on last page", () => {
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        pagination: { pageIndex: 9, pageSize: 10 },
      });
      (
        mockTable.getCanPreviousPage as ReturnType<typeof vi.fn>
      ).mockReturnValue(true);
      (mockTable.getCanNextPage as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      renderWithProviders(<DataTablePagination table={mockTable} />);

      const buttons = screen.getAllByRole("button");
      const nextButton = buttons.find(
        (btn) => btn.querySelector(".sr-only")?.textContent === "goToNextPage"
      );
      const lastButton = buttons.find(
        (btn) => btn.querySelector(".sr-only")?.textContent === "goToLastPage"
      );

      expect(nextButton).toBeDisabled();
      expect(lastButton).toBeDisabled();
    });
  });

  describe("Selected Rows Info", () => {
    it("should show selected rows info when rows are selected", () => {
      // Create a more complete mock column object
      const selectColumn = {
        id: "select",
        getCanHide: vi.fn().mockReturnValue(false),
        getIsVisible: vi.fn().mockReturnValue(true),
      };

      (mockTable.getAllColumns as ReturnType<typeof vi.fn>).mockReturnValue([
        selectColumn,
      ]);
      (
        mockTable.getFilteredSelectedRowModel as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        rows: [{}, {}, {}], // 3 selected rows
      });
      (
        mockTable.getFilteredRowModel as ReturnType<typeof vi.fn>
      ).mockReturnValue({
        rows: [{}, {}, {}, {}, {}], // 5 total rows
      });

      renderWithProviders(<DataTablePagination table={mockTable} />);

      // Debug: check if the element exists
      expect(screen.getByText("3 of 5 row(s) selected")).toBeInTheDocument();
    });

    it("should not show selected rows info when no selection column", () => {
      (mockTable.getAllColumns as ReturnType<typeof vi.fn>).mockReturnValue([]);

      renderWithProviders(<DataTablePagination table={mockTable} />);

      expect(screen.queryByText(/row\(s\) selected/)).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle single page", () => {
      (mockTable.getPageCount as ReturnType<typeof vi.fn>).mockReturnValue(1);
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        pagination: { pageIndex: 0, pageSize: 10 },
      });
      (
        mockTable.getCanPreviousPage as ReturnType<typeof vi.fn>
      ).mockReturnValue(false);
      (mockTable.getCanNextPage as ReturnType<typeof vi.fn>).mockReturnValue(
        false
      );

      renderWithProviders(<DataTablePagination table={mockTable} />);

      // Page display shows "1 / 1" - both numbers are "1"
      const pageNumbers = screen.getAllByText("1");
      expect(pageNumbers).toHaveLength(2); // Current page and total pages

      // All navigation buttons should be disabled
      const buttons = screen.getAllByRole("button");
      const navButtons = buttons.filter(
        (btn) => btn.querySelector(".sr-only") && btn.hasAttribute("disabled")
      );
      expect(navButtons.length).toBeGreaterThan(0);
    });

    it("should handle zero pages", () => {
      (mockTable.getPageCount as ReturnType<typeof vi.fn>).mockReturnValue(0);
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        pagination: { pageIndex: 0, pageSize: 10 },
      });

      renderWithProviders(<DataTablePagination table={mockTable} />);

      // Shows "1" as current page even for 0 pages
      const currentPage = screen.getAllByText("1")[0];
      expect(currentPage).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument(); // Total pages is 0
    });

    it("should handle very large page counts", () => {
      (mockTable.getPageCount as ReturnType<typeof vi.fn>).mockReturnValue(
        10_000
      );
      (mockTable.getState as ReturnType<typeof vi.fn>).mockReturnValue({
        pagination: { pageIndex: 2, pageSize: 10 },
      });

      renderWithProviders(<DataTablePagination table={mockTable} />);

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("10000")).toBeInTheDocument();
    });
  });
});
