/**
 * @vitest-environment happy-dom
 */
import { createMockTable, renderWithProviders } from "@test/helpers/test-utils";
import { renderHook, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  SelectionCell,
  SelectionHeader,
  SelectionSummary,
  useSelection,
} from "./data-table-selection";

describe("SelectionHeader", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("should render checkbox with correct initial state", () => {
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(false),
        getSelectedRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(<SelectionHeader table={mockTable} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      expect(checkbox).toHaveAttribute("aria-label", "bulkActions.selectAll");
    });

    it("should show checked state when all selected", () => {
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(true),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(false),
        getSelectedRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(<SelectionHeader table={mockTable} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
      expect(checkbox).toHaveAttribute(
        "aria-label",
        "bulkActions.clearSelection"
      );
    });

    it("should show indeterminate state when some selected", () => {
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(true),
        getSelectedRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 3 }) }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(<SelectionHeader table={mockTable} />);

      const checkbox = screen.getByRole("checkbox");
      // Indeterminate state is represented as checked="indeterminate"
      expect(checkbox).toHaveAttribute("aria-label", "3 of 5 rows selected");
    });
  });

  describe("User Interactions", () => {
    it("should toggle all rows when checkbox clicked", async () => {
      const toggleAllPageRowsSelected = vi.fn();
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(false),
        toggleAllPageRowsSelected,
        getSelectedRowModel: vi.fn().mockReturnValue({ rows: [] }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(<SelectionHeader table={mockTable} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(toggleAllPageRowsSelected).toHaveBeenCalled();
    });

    it("should show select all button when some selected", () => {
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(true),
        getSelectedRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 3 }) }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(<SelectionHeader table={mockTable} />);

      const selectAllButton = screen.getByRole("button", {
        name: "bulkActions.selectAll",
      });
      expect(selectAllButton).toBeInTheDocument();
    });

    it("should call selectAll when select all button clicked", async () => {
      const toggleAllPageRowsSelected = vi.fn();
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(true),
        toggleAllPageRowsSelected,
        getSelectedRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 3 }) }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(<SelectionHeader table={mockTable} />);

      const selectAllButton = screen.getByRole("button", {
        name: "bulkActions.selectAll",
      });
      await user.click(selectAllButton);

      expect(toggleAllPageRowsSelected).toHaveBeenCalledWith(true);
    });

    it("should show clear button when items selected", () => {
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(true),
        getSelectedRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 3 }) }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(<SelectionHeader table={mockTable} />);

      const clearButton = screen.getByRole("button", {
        name: "bulkActions.clearSelection",
      });
      expect(clearButton).toBeInTheDocument();
    });

    it("should call clearSelection when clear button clicked", async () => {
      const toggleAllPageRowsSelected = vi.fn();
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(true),
        toggleAllPageRowsSelected,
        getSelectedRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 3 }) }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(<SelectionHeader table={mockTable} />);

      const clearButton = screen.getByRole("button", {
        name: "bulkActions.clearSelection",
      });
      await user.click(clearButton);

      expect(toggleAllPageRowsSelected).toHaveBeenCalledWith(false);
    });
  });

  describe("Props and Customization", () => {
    it("should hide select all button when showSelectAllButton is false", () => {
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(true),
        getSelectedRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 3 }) }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(
        <SelectionHeader table={mockTable} showSelectAllButton={false} />
      );

      const selectAllButton = screen.queryByRole("button", {
        name: "bulkActions.selectAll",
      });
      expect(selectAllButton).not.toBeInTheDocument();
    });

    it("should hide clear button when showClearButton is false", () => {
      const mockTable = createMockTable({
        getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
        getIsSomePageRowsSelected: vi.fn().mockReturnValue(true),
        getSelectedRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 3 }) }),
        getRowModel: vi
          .fn()
          .mockReturnValue({ rows: Array.from({ length: 5 }) }),
      });

      renderWithProviders(
        <SelectionHeader table={mockTable} showClearButton={false} />
      );

      const clearButton = screen.queryByRole("button", {
        name: "bulkActions.clearSelection",
      });
      expect(clearButton).not.toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const mockTable = createMockTable();

      const { container } = renderWithProviders(
        <SelectionHeader table={mockTable} className="custom-class" />
      );

      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveClass("custom-class");
    });
  });
});

describe("SelectionCell", () => {
  const user = userEvent.setup();

  describe("Basic Rendering", () => {
    it("should render checkbox with correct state", () => {
      const mockRow = {
        getIsSelected: vi.fn().mockReturnValue(false),
        toggleSelected: vi.fn(),
        index: 0,
      };

      renderWithProviders(<SelectionCell row={mockRow} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
      expect(checkbox).toHaveAttribute("aria-label", "Select row 1");
    });

    it("should show checked state when row selected", () => {
      const mockRow = {
        getIsSelected: vi.fn().mockReturnValue(true),
        toggleSelected: vi.fn(),
        index: 2,
      };

      renderWithProviders(<SelectionCell row={mockRow} />);

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeChecked();
    });

    it("should show row number when showRowNumber is true and not selected", () => {
      const mockRow = {
        getIsSelected: vi.fn().mockReturnValue(false),
        toggleSelected: vi.fn(),
        index: 4,
      };

      renderWithProviders(<SelectionCell row={mockRow} showRowNumber={true} />);

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("should hide row number when selected", () => {
      const mockRow = {
        getIsSelected: vi.fn().mockReturnValue(true),
        toggleSelected: vi.fn(),
        index: 4,
      };

      renderWithProviders(<SelectionCell row={mockRow} showRowNumber={true} />);

      expect(screen.queryByText("5")).not.toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should toggle row selection when clicked", async () => {
      const toggleSelected = vi.fn();
      const mockRow = {
        getIsSelected: vi.fn().mockReturnValue(false),
        toggleSelected,
        index: 0,
      };

      renderWithProviders(<SelectionCell row={mockRow} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(toggleSelected).toHaveBeenCalledWith(true);
    });

    it("should handle unchecking", async () => {
      const toggleSelected = vi.fn();
      const mockRow = {
        getIsSelected: vi.fn().mockReturnValue(true),
        toggleSelected,
        index: 0,
      };

      renderWithProviders(<SelectionCell row={mockRow} />);

      const checkbox = screen.getByRole("checkbox");
      await user.click(checkbox);

      expect(toggleSelected).toHaveBeenCalledWith(false);
    });
  });

  describe("Props and Customization", () => {
    it("should apply custom className", () => {
      const mockRow = {
        getIsSelected: vi.fn().mockReturnValue(false),
        toggleSelected: vi.fn(),
        index: 0,
      };

      const { container } = renderWithProviders(
        <SelectionCell row={mockRow} className="custom-class" />
      );

      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveClass("custom-class");
    });
  });
});

describe("SelectionSummary", () => {
  describe("Basic Rendering", () => {
    it("should render nothing when no items selected", () => {
      const { container } = renderWithProviders(
        <SelectionSummary selectedCount={0} totalCount={10} />
      );

      expect(container.firstChild).toBeNull();
    });

    it("should render compact variant by default", () => {
      renderWithProviders(
        <SelectionSummary selectedCount={3} totalCount={10} />
      );

      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.queryByText("of")).not.toBeInTheDocument();
    });

    it("should render detailed variant when specified", () => {
      renderWithProviders(
        <SelectionSummary
          selectedCount={3}
          totalCount={10}
          variant="detailed"
        />
      );

      expect(screen.getByText("3 selected")).toBeInTheDocument();
      expect(screen.getByText("of")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("items")).toBeInTheDocument();
    });

    it("should use singular form for single item", () => {
      renderWithProviders(
        <SelectionSummary selectedCount={1} totalCount={1} variant="detailed" />
      );

      expect(screen.getByText("item")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const { container } = renderWithProviders(
        <SelectionSummary
          selectedCount={3}
          totalCount={10}
          className="custom-class"
        />
      );

      const wrapper = container.firstElementChild;
      expect(wrapper).toHaveClass("custom-class");
    });
  });
});

describe("useSelection hook", () => {
  it("should return selection state and methods", () => {
    const selectedRows = [{ original: { id: 1 } }, { original: { id: 2 } }];

    const mockTable = createMockTable({
      getSelectedRowModel: vi.fn().mockReturnValue({ rows: selectedRows }),
      getRowModel: vi.fn().mockReturnValue({ rows: Array.from({ length: 5 }) }),
      getIsAllPageRowsSelected: vi.fn().mockReturnValue(false),
      getIsSomePageRowsSelected: vi.fn().mockReturnValue(true),
      toggleAllRowsSelected: vi.fn(),
    });

    const { result } = renderHook(() => useSelection(mockTable));

    expect(result.current.selectedCount).toBe(2);
    expect(result.current.totalCount).toBe(5);
    expect(result.current.isAllSelected).toBe(false);
    expect(result.current.isSomeSelected).toBe(true);
    expect(result.current.selectionPercentage).toBe(40);
    expect(result.current.selectedData).toEqual([{ id: 1 }, { id: 2 }]);
  });

  it("should call table methods when selection methods called", () => {
    const toggleAllRowsSelected = vi.fn();
    const mockTable = createMockTable({
      getSelectedRowModel: vi.fn().mockReturnValue({ rows: [] }),
      getRowModel: vi.fn().mockReturnValue({ rows: [] }),
      toggleAllRowsSelected,
    });

    const { result } = renderHook(() => useSelection(mockTable));

    // Select all
    result.current.selectAll();
    expect(toggleAllRowsSelected).toHaveBeenCalledWith(true);

    // Clear selection
    result.current.clearSelection();
    expect(toggleAllRowsSelected).toHaveBeenCalledWith(false);
  });

  it("should invert selection correctly", () => {
    const rows = [
      { getIsSelected: vi.fn().mockReturnValue(true), toggleSelected: vi.fn() },
      {
        getIsSelected: vi.fn().mockReturnValue(false),
        toggleSelected: vi.fn(),
      },
      { getIsSelected: vi.fn().mockReturnValue(true), toggleSelected: vi.fn() },
    ];

    const mockTable = createMockTable({
      getSelectedRowModel: vi.fn().mockReturnValue({ rows: [] }),
      getRowModel: vi.fn().mockReturnValue({ rows }),
    });

    const { result } = renderHook(() => useSelection(mockTable));

    result.current.invertSelection();

    expect(rows[0]?.toggleSelected).toHaveBeenCalledWith(false);
    expect(rows[1]?.toggleSelected).toHaveBeenCalledWith(true);
    expect(rows[2]?.toggleSelected).toHaveBeenCalledWith(false);
  });

  it("should handle empty table", () => {
    const mockTable = createMockTable({
      getSelectedRowModel: vi.fn().mockReturnValue({ rows: [] }),
      getRowModel: vi.fn().mockReturnValue({ rows: [] }),
    });

    const { result } = renderHook(() => useSelection(mockTable));

    expect(result.current.selectedCount).toBe(0);
    expect(result.current.totalCount).toBe(0);
    expect(result.current.selectionPercentage).toBe(0);
  });
});
