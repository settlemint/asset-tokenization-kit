/**
 * @vitest-environment happy-dom
 */
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { renderWithProviders } from "@test/helpers/test-utils";
import { screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createBasicSelectionColumn,
  createSelectionColumn,
} from "./selection-column";

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

// Sample data for testing
interface TestUser {
  id: number;
  name: string;
  email: string;
}

const testData: TestUser[] = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com" },
];

// Test table component
function TestTable({
  column,
  data = testData,
}: {
  column: ReturnType<typeof createBasicSelectionColumn<TestUser>>;
  data?: TestUser[];
}) {
  const [rowSelection, setRowSelection] = useState({});
  const columnHelper = createColumnHelper<TestUser>();

  const columns = [
    column,
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => info.getValue(),
    }),
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    state: {
      rowSelection,
    },
  });

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : typeof header.column.columnDef.header === "function"
                      ? header.column.columnDef.header(header.getContext())
                      : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id}>
                  {typeof cell.column.columnDef.cell === "function"
                    ? cell.column.columnDef.cell(cell.getContext())
                    : cell.column.columnDef.cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

describe("Selection Column", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBasicSelectionColumn", () => {
    describe("Column Configuration", () => {
      it("should create column with correct basic configuration", () => {
        const column = createBasicSelectionColumn<TestUser>();

        expect(column.id).toBe("select");
        expect(column.enableSorting).toBe(false);
        expect(column.enableHiding).toBe(false);
        expect(column.size).toBe(40);
        expect(column.minSize).toBe(40);
        expect(column.maxSize).toBe(40);
        expect(column.meta?.enableCsvExport).toBe(false);
      });

      it("should have header and cell functions", () => {
        const column = createBasicSelectionColumn<TestUser>();

        expect(typeof column.header).toBe("function");
        expect(typeof column.cell).toBe("function");
      });
    });

    describe("Header Checkbox", () => {
      it("should render header checkbox with correct accessibility attributes", () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        const headerCheckbox = screen.getByLabelText(
          "Select all rows on this page"
        );
        expect(headerCheckbox).toBeInTheDocument();
        expect(headerCheckbox).toHaveAttribute("role", "checkbox");
      });

      it("should show unchecked state when no rows are selected", () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        const headerCheckbox = screen.getByLabelText(
          "Select all rows on this page"
        );
        expect(headerCheckbox).not.toBeChecked();
      });

      it("should toggle all rows when header checkbox is clicked", async () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        const headerCheckbox = screen.getByLabelText(
          "Select all rows on this page"
        );
        await user.click(headerCheckbox);

        // All row checkboxes should be checked
        const rowCheckboxes = screen.getAllByLabelText(/^Select row \d+$/);
        rowCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked();
        });
      });

      it("should show indeterminate state when some rows are selected", async () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        // Select only the first row
        const firstRowCheckbox = screen.getByLabelText("Select row 1");
        await user.click(firstRowCheckbox);

        await waitFor(() => {
          const headerCheckbox = screen.getByLabelText(
            "Select all rows on this page"
          );
          // In React, indeterminate state is represented by the indeterminate property
          // but in testing, we can check if it's not fully checked but has some selection
          expect(firstRowCheckbox).toBeChecked();
          expect(headerCheckbox).not.toBeChecked(); // Not all selected
        });
      });

      it("should uncheck all rows when clicked while all are selected", async () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        // First select all
        const headerCheckbox = screen.getByLabelText(
          "Select all rows on this page"
        );
        await user.click(headerCheckbox);

        // Verify all are selected
        const rowCheckboxes = screen.getAllByLabelText(/^Select row \d+$/);
        rowCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked();
        });

        // Then unselect all
        await user.click(headerCheckbox);

        // Verify all are unselected
        rowCheckboxes.forEach((checkbox) => {
          expect(checkbox).not.toBeChecked();
        });
      });
    });

    describe("Row Checkboxes", () => {
      it("should render row checkboxes with correct accessibility attributes", () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        testData.forEach((_, index) => {
          const rowCheckbox = screen.getByLabelText(`Select row ${index + 1}`);
          expect(rowCheckbox).toBeInTheDocument();
          expect(rowCheckbox).toHaveAttribute("role", "checkbox");
        });
      });

      it("should start with all rows unselected", () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        const rowCheckboxes = screen.getAllByLabelText(/^Select row \d+$/);
        rowCheckboxes.forEach((checkbox) => {
          expect(checkbox).not.toBeChecked();
        });
      });

      it("should toggle individual row selection", async () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        const firstRowCheckbox = screen.getByLabelText("Select row 1");

        // Initially unchecked
        expect(firstRowCheckbox).not.toBeChecked();

        // Click to select
        await user.click(firstRowCheckbox);
        expect(firstRowCheckbox).toBeChecked();

        // Click to unselect
        await user.click(firstRowCheckbox);
        expect(firstRowCheckbox).not.toBeChecked();
      });

      it("should allow multiple row selection", async () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        const firstRowCheckbox = screen.getByLabelText("Select row 1");
        const secondRowCheckbox = screen.getByLabelText("Select row 2");

        await user.click(firstRowCheckbox);
        await user.click(secondRowCheckbox);

        expect(firstRowCheckbox).toBeChecked();
        expect(secondRowCheckbox).toBeChecked();

        const thirdRowCheckbox = screen.getByLabelText("Select row 3");
        expect(thirdRowCheckbox).not.toBeChecked();
      });

      it("should prevent event propagation on row checkbox click", async () => {
        const rowClickHandler = vi.fn();
        const column = createBasicSelectionColumn<TestUser>();

        // Create a modified TestTable that adds row click handlers
        function TestTableWithRowClick() {
          const [rowSelection, setRowSelection] = useState({});
          const columnHelper = createColumnHelper<TestUser>();

          const columns = [
            column,
            columnHelper.accessor("name", {
              header: "Name",
              cell: (info) => info.getValue(),
            }),
          ];

          const table = useReactTable({
            data: testData,
            columns,
            getCoreRowModel: getCoreRowModel(),
            enableRowSelection: true,
            onRowSelectionChange: setRowSelection,
            state: {
              rowSelection,
            },
          });

          return (
            <div>
              <table>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : typeof header.column.columnDef.header ===
                                "function"
                              ? header.column.columnDef.header(
                                  header.getContext()
                                )
                              : header.column.columnDef.header}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} onClick={rowClickHandler}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {typeof cell.column.columnDef.cell === "function"
                            ? cell.column.columnDef.cell(cell.getContext())
                            : cell.column.columnDef.cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        renderWithProviders(<TestTableWithRowClick />);

        const firstRowCheckbox = screen.getByLabelText("Select row 1");
        await user.click(firstRowCheckbox);

        // Row click handler should not be called due to stopPropagation
        expect(rowClickHandler).not.toHaveBeenCalled();
        expect(firstRowCheckbox).toBeChecked();
      });
    });

    describe("Edge Cases", () => {
      it("should handle empty data", () => {
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} data={[]} />);

        const headerCheckbox = screen.getByLabelText(
          "Select all rows on this page"
        );
        expect(headerCheckbox).toBeInTheDocument();
        expect(headerCheckbox).not.toBeChecked();

        // Should not have any row checkboxes
        const rowCheckboxes = screen.queryAllByLabelText(/^Select row \d+$/);
        expect(rowCheckboxes).toHaveLength(0);
      });

      it("should handle single row data", async () => {
        const singleRowData = [testData[0]];
        const column = createBasicSelectionColumn<TestUser>();
        renderWithProviders(
          <TestTable column={column} data={singleRowData as TestUser[]} />
        );

        const headerCheckbox = screen.getByLabelText(
          "Select all rows on this page"
        );
        const rowCheckbox = screen.getByLabelText("Select row 1");

        // Select the single row
        await user.click(rowCheckbox);
        expect(rowCheckbox).toBeChecked();

        // Header should also be checked since all rows are selected
        await waitFor(() => {
          expect(headerCheckbox).toBeChecked();
        });
      });
    });
  });

  describe("createSelectionColumn", () => {
    describe("Column Configuration", () => {
      it("should create column with enhanced configuration", () => {
        const column = createSelectionColumn<TestUser>();

        expect(column.id).toBe("select");
        expect(column.enableSorting).toBe(false);
        expect(column.enableHiding).toBe(false);
        expect(column.enableColumnFilter).toBe(false);
        expect(column.enableGlobalFilter).toBe(false);
        expect(column.size).toBe(40);
        expect(column.minSize).toBe(40);
        expect(column.maxSize).toBe(40);
        expect(column.meta?.enableCsvExport).toBe(false);
      });

      it("should accept options parameter", () => {
        const options = {
          enableSelectAll: false,
          ariaLabel: "Custom select all",
          className: "custom-checkbox",
        };

        const column = createSelectionColumn<TestUser>(options);
        expect(typeof column.header).toBe("function");
        expect(typeof column.cell).toBe("function");
      });
    });

    describe("Header with Options", () => {
      it("should render enhanced header checkbox with default options", () => {
        const column = createSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        const headerCheckbox = screen.getByLabelText(/^Select all \d+ rows/);
        expect(headerCheckbox).toBeInTheDocument();
      });

      it("should render placeholder when enableSelectAll is false", () => {
        const column = createSelectionColumn<TestUser>({
          enableSelectAll: false,
        });
        renderWithProviders(<TestTable column={column} />);

        // Should not have a header checkbox
        const headerCheckbox = screen.queryByLabelText(/^Select all/);
        expect(headerCheckbox).not.toBeInTheDocument();

        // Should have a placeholder div
        const columnHeaders = screen.getAllByRole("columnheader");
        const placeholder = columnHeaders[0]?.querySelector("div.w-10");
        expect(placeholder).toBeInTheDocument();
      });

      it("should use custom aria label when provided", () => {
        const customLabel = "Select all users in table";
        const column = createSelectionColumn<TestUser>({
          ariaLabel: customLabel,
        });
        renderWithProviders(<TestTable column={column} />);

        const headerCheckbox = screen.getByLabelText(customLabel);
        expect(headerCheckbox).toBeInTheDocument();
      });

      it("should apply custom className to header checkbox", () => {
        const customClass = "custom-header-checkbox";
        const column = createSelectionColumn<TestUser>({
          className: customClass,
        });
        renderWithProviders(<TestTable column={column} />);

        const headerCheckbox = screen.getByLabelText(/^Select all/);
        expect(headerCheckbox).toHaveClass(customClass);
      });

      it("should show enhanced aria label with selection state", async () => {
        const column = createSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        // Initially should show total count
        let headerCheckbox = screen.getByLabelText("Select all 3 rows");
        expect(headerCheckbox).toBeInTheDocument();

        // Select one row to trigger "some selected" state
        const firstRowCheckbox = screen.getByLabelText("Select row 1 of 3");
        await user.click(firstRowCheckbox);

        await waitFor(() => {
          // Should update to show "some selected" state
          headerCheckbox = screen.getByLabelText(
            "Select all 3 rows (some selected)"
          );
          expect(headerCheckbox).toBeInTheDocument();
        });
      });
    });

    describe("Enhanced Row Checkboxes", () => {
      it("should render row checkboxes with enhanced accessibility", () => {
        const column = createSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        testData.forEach((_, index) => {
          const rowCheckbox = screen.getByLabelText(
            `Select row ${index + 1} of ${testData.length}`
          );
          expect(rowCheckbox).toBeInTheDocument();
        });
      });

      it("should apply custom className to row checkboxes", () => {
        const customClass = "custom-row-checkbox";
        const column = createSelectionColumn<TestUser>({
          className: customClass,
        });
        renderWithProviders(<TestTable column={column} />);

        const rowCheckboxes = screen.getAllByLabelText(
          /^Select row \d+ of \d+$/
        );
        rowCheckboxes.forEach((checkbox) => {
          expect(checkbox).toHaveClass(customClass);
        });
      });

      it("should maintain event propagation prevention", async () => {
        const rowClickHandler = vi.fn();
        const column = createSelectionColumn<TestUser>();

        // Similar setup as in basic test but with enhanced column
        function TestTableWithRowClick() {
          const [rowSelection, setRowSelection] = useState({});
          const columnHelper = createColumnHelper<TestUser>();

          const columns = [
            column,
            columnHelper.accessor("name", {
              header: "Name",
              cell: (info) => info.getValue(),
            }),
          ];

          const table = useReactTable({
            data: testData,
            columns,
            getCoreRowModel: getCoreRowModel(),
            enableRowSelection: true,
            onRowSelectionChange: setRowSelection,
            state: {
              rowSelection,
            },
          });

          return (
            <div>
              <table>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : typeof header.column.columnDef.header ===
                                "function"
                              ? header.column.columnDef.header(
                                  header.getContext()
                                )
                              : header.column.columnDef.header}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} onClick={rowClickHandler}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {typeof cell.column.columnDef.cell === "function"
                            ? cell.column.columnDef.cell(cell.getContext())
                            : cell.column.columnDef.cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        renderWithProviders(<TestTableWithRowClick />);

        const firstRowCheckbox = screen.getByLabelText("Select row 1 of 3");
        await user.click(firstRowCheckbox);

        expect(rowClickHandler).not.toHaveBeenCalled();
        expect(firstRowCheckbox).toBeChecked();
      });
    });

    describe("Options Combinations", () => {
      it("should work with all options disabled/customized", () => {
        const column = createSelectionColumn<TestUser>({
          enableSelectAll: false,
          ariaLabel: "This should not be used",
          className: "custom-class",
        });

        renderWithProviders(<TestTable column={column} />);

        // No header checkbox due to enableSelectAll: false
        const headerCheckbox = screen.queryByLabelText(/select all/i);
        expect(headerCheckbox).not.toBeInTheDocument();

        // Row checkboxes should still have custom class
        const rowCheckboxes = screen.getAllByLabelText(
          /^Select row \d+ of \d+$/
        );
        rowCheckboxes.forEach((checkbox) => {
          expect(checkbox).toHaveClass("custom-class");
        });
      });

      it("should handle empty options object", () => {
        const column = createSelectionColumn<TestUser>({});
        renderWithProviders(<TestTable column={column} />);

        // Should work with defaults
        const headerCheckbox = screen.getByLabelText("Select all 3 rows");
        expect(headerCheckbox).toBeInTheDocument();

        const rowCheckboxes = screen.getAllByLabelText(
          /^Select row \d+ of \d+$/
        );
        expect(rowCheckboxes).toHaveLength(3);
      });

      it("should handle undefined options", () => {
        const column = createSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        // Should work with defaults when no options provided
        const headerCheckbox = screen.getByLabelText("Select all 3 rows");
        expect(headerCheckbox).toBeInTheDocument();

        const rowCheckboxes = screen.getAllByLabelText(
          /^Select row \d+ of \d+$/
        );
        expect(rowCheckboxes).toHaveLength(3);
      });
    });

    describe("Advanced Selection Behavior", () => {
      it("should maintain selection state during re-renders", async () => {
        const column = createSelectionColumn<TestUser>();
        const { rerender } = renderWithProviders(<TestTable column={column} />);

        // Select a row
        const firstRowCheckbox = screen.getByLabelText("Select row 1 of 3");
        await user.click(firstRowCheckbox);
        expect(firstRowCheckbox).toBeChecked();

        // Re-render the component
        rerender(<TestTable column={column} />);

        // Selection should persist
        const updatedFirstRowCheckbox =
          screen.getByLabelText("Select row 1 of 3");
        expect(updatedFirstRowCheckbox).toBeChecked();
      });

      it("should handle indeterminate state correctly", async () => {
        const column = createSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} />);

        // Select first row
        const firstRowCheckbox = screen.getByLabelText("Select row 1 of 3");
        await user.click(firstRowCheckbox);

        await waitFor(() => {
          // Header should show indeterminate state text
          const headerCheckbox = screen.getByLabelText(
            "Select all 3 rows (some selected)"
          );
          expect(headerCheckbox).toBeInTheDocument();
        });

        // Select all remaining rows by clicking header
        const headerCheckbox = screen.getByLabelText(
          "Select all 3 rows (some selected)"
        );
        await user.click(headerCheckbox);

        // All rows should be selected now
        const allRowCheckboxes = screen.getAllByLabelText(
          /^Select row \d+ of \d+$/
        );
        allRowCheckboxes.forEach((checkbox) => {
          expect(checkbox).toBeChecked();
        });

        await waitFor(() => {
          // Header should no longer show "some selected"
          const updatedHeaderCheckbox =
            screen.getByLabelText("Select all 3 rows");
          expect(updatedHeaderCheckbox).toBeInTheDocument();
        });
      });
    });

    describe("Edge Cases and Error Handling", () => {
      it("should handle empty data gracefully", () => {
        const column = createSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} data={[]} />);

        const headerCheckbox = screen.getByLabelText("Select all 0 rows");
        expect(headerCheckbox).toBeInTheDocument();
        expect(headerCheckbox).not.toBeChecked();
      });

      it("should handle large datasets efficiently", () => {
        const largeDataset = Array.from({ length: 100 }, (_, i) => ({
          id: i + 1,
          name: `User ${i + 1}`,
          email: `user${i + 1}@example.com`,
        }));

        const column = createSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} data={largeDataset} />);

        const headerCheckbox = screen.getByLabelText("Select all 100 rows");
        expect(headerCheckbox).toBeInTheDocument();

        const rowCheckboxes = screen.getAllByLabelText(
          /^Select row \d+ of 100$/
        );
        expect(rowCheckboxes).toHaveLength(100);
      });

      it("should handle special characters in data", () => {
        const specialData = [
          { id: 1, name: 'User with "quotes"', email: "test@example.com" },
          { id: 2, name: "User with <tags>", email: "test2@example.com" },
        ];

        const column = createSelectionColumn<TestUser>();
        renderWithProviders(<TestTable column={column} data={specialData} />);

        const headerCheckbox = screen.getByLabelText("Select all 2 rows");
        expect(headerCheckbox).toBeInTheDocument();

        const rowCheckboxes = screen.getAllByLabelText(/^Select row \d+ of 2$/);
        expect(rowCheckboxes).toHaveLength(2);
      });
    });
  });

  describe("Function Comparison", () => {
    it("should have different behaviors between basic and enhanced versions", () => {
      const basicColumn = createBasicSelectionColumn<TestUser>();
      const enhancedColumn = createSelectionColumn<TestUser>();

      // Basic column should not have the enhanced filter options
      expect(basicColumn.enableColumnFilter).toBeUndefined();
      expect(basicColumn.enableGlobalFilter).toBeUndefined();

      // Enhanced column should have these options explicitly disabled
      expect(enhancedColumn.enableColumnFilter).toBe(false);
      expect(enhancedColumn.enableGlobalFilter).toBe(false);
    });

    it("should render different aria labels", () => {
      const basicColumn = createBasicSelectionColumn<TestUser>();
      const { unmount } = renderWithProviders(
        <TestTable column={basicColumn} />
      );

      // Basic version uses simple label
      const basicHeaderCheckbox = screen.getByLabelText(
        "Select all rows on this page"
      );
      expect(basicHeaderCheckbox).toBeInTheDocument();

      unmount();

      // Enhanced version uses count-based label
      const enhancedColumn = createSelectionColumn<TestUser>();
      renderWithProviders(<TestTable column={enhancedColumn} />);

      const enhancedHeaderCheckbox = screen.getByLabelText("Select all 3 rows");
      expect(enhancedHeaderCheckbox).toBeInTheDocument();
    });
  });
});
