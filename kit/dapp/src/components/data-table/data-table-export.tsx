import { Button } from "@/components/ui/button";
import type { Column, Table } from "@tanstack/react-table";
import { Download } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

/**
 * Formats a cell value for CSV export.
 * Handles various data types including dates, objects, and primitives.
 * Escapes double quotes and wraps values in quotes as needed.
 *
 * @param value - The cell value to format
 * @returns CSV-formatted string value
 */
function formatCellValue(value: unknown): string {
  if (value == null) {
    return '""';
  }

  if (value instanceof Date) {
    return `"${value.toISOString()}"`;
  }

  if (typeof value === "object") {
    return `"${JSON.stringify(value).replaceAll('"', '""')}"`;
  }

  if (typeof value === "string") {
    return `"${value.replaceAll('"', '""')}"`;
  }

  // At this point, value can only be number, boolean, bigint, symbol, or function
  // Functions shouldn't be in table data, and we can safely stringify primitives
  if (typeof value === "function") {
    return '""';
  }
  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "bigint"
  ) {
    return String(value);
  }
  // Handle other types safely
  return '""';
}

/**
 * Extracts the display header text from a column definition.
 * Falls back to column ID if no header is defined.
 *
 * @param column - The table column
 * @returns The column header text
 */
function getColumnHeader<TData>(column: Column<TData>): string {
  const header = column.columnDef.header;

  if (typeof header === "string") {
    return header;
  }

  return column.id;
}

/**
 * Exports table data to a CSV file.
 * Includes BOM for Excel compatibility and respects column export settings.
 *
 * @param table - The TanStack table instance
 * @param errorMessage - Error message to display if export fails
 */
function exportTableToCSV<TData>(
  table: Table<TData>,
  errorMessage: string
): void {
  try {
    // Add BOM for Excel compatibility
    const BOM = "\uFEFF";

    // Retrieve headers (column names)
    const headers = table
      .getAllLeafColumns()
      .filter((column) => {
        // Check enableCsvExport meta property (default is true)
        const enableExport = column.columnDef.meta?.enableCsvExport;
        return enableExport !== false;
      })
      .map((column) => ({
        id: column.id,
        header: getColumnHeader(column),
      }));

    // Build CSV content
    const csvContent = [
      headers.map(({ header }) => `"${header}"`).join(","),
      ...table
        .getRowModel()
        .rows.map((row) =>
          headers.map(({ id }) => formatCellValue(row.getValue(id))).join(",")
        ),
    ].join("\n");

    // Create a Blob with CSV content
    const blob = new Blob([BOM + csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    // Create a link and trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${table.options.meta?.name ?? "table"}.csv`);
    link.style.visibility = "hidden";
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  } catch {
    toast.error(errorMessage);
  }
}

/**
 * Props for the DataTableExport component.
 */
interface DataTableExportProps<TData> {
  /** The TanStack table instance to export data from. */
  table: Table<TData>;
}

/**
 * Export button component for data tables.
 * Exports visible table data to CSV format with proper formatting.
 *
 * @example
 * ```tsx
 * <DataTableExport table={table} />
 * ```
 *
 * @param props - Component props
 * @returns Export button component
 */
export function DataTableExport<TData>({ table }: DataTableExportProps<TData>) {
  const { t } = useTranslation("data-table");

  const handleExport = useCallback(() => {
    exportTableToCSV(table, t("failedExport"));
  }, [table, t]);

  return (
    <div className="ml-2 flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        className="gap-2 border-muted-foreground text-muted-foreground"
      >
        <Download className="size-4" aria-hidden="true" />
        {t("export")}
      </Button>
    </div>
  );
}
