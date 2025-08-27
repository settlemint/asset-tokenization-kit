import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef } from "@tanstack/react-table";

/**
 * Creates a basic selection column for data tables with simple checkbox functionality
 */
export function createBasicSelectionColumn<TData>(): ColumnDef<TData> {
  return {
    id: "select",
    header: ({ table }) => {
      function handleToggleAll(value: unknown) {
        table.toggleAllPageRowsSelected(!!value);
      }

      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={handleToggleAll}
          aria-label="Select all rows on this page"
        />
      );
    },
    cell: ({ row }) => {
      function handleToggleRow(value: unknown) {
        row.toggleSelected(!!value);
      }

      function handleClick(e: React.MouseEvent) {
        e.stopPropagation();
      }

      return (
        <div onClick={handleClick}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={handleToggleRow}
            aria-label={`Select row ${String(row.index + 1)}`}
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
    meta: {
      type: "none",
      enableCsvExport: false,
    },
  };
}

/**
 * Creates a selection column for data tables with enhanced accessibility and styling.
 * This is the default SOTA (State of the Art) implementation with improved accessibility.
 *
 * @template TData The type of data in the table rows
 * @param options Configuration options for the selection column
 * @param options.enableSelectAll Whether to enable the "select all" checkbox in the header. Defaults to true
 * @param options.ariaLabel Custom aria-label for the select all checkbox. If not provided, a descriptive label is generated
 * @param options.className Custom CSS class name to apply to the checkboxes
 * @returns A column definition configured for row selection with enhanced accessibility
 *
 * @example
 * ```tsx
 * const columns = [
 *   createSelectionColumn<User>({
 *     enableSelectAll: true,
 *     className: "my-checkbox-class"
 *   }),
 *   // ... other columns
 * ];
 * ```
 */
export function createSelectionColumn<TData>(
  options: {
    enableSelectAll?: boolean;
    ariaLabel?: string;
    className?: string;
  } = {}
): ColumnDef<TData> {
  const { enableSelectAll = true, ariaLabel, className } = options;

  return {
    id: "select",
    header: ({ table }) => {
      if (!enableSelectAll) {
        return <div className="w-10" />;
      }

      const isAllSelected = table.getIsAllPageRowsSelected();
      const isSomeSelected = table.getIsSomePageRowsSelected();

      function handleToggleAll(value: unknown) {
        table.toggleAllPageRowsSelected(!!value);
      }

      return (
        <Checkbox
          checked={isAllSelected || (isSomeSelected && "indeterminate")}
          onCheckedChange={handleToggleAll}
          aria-label={
            ariaLabel ??
            `Select all ${String(table.getRowModel().rows.length)} rows${
              isSomeSelected && !isAllSelected ? " (some selected)" : ""
            }`
          }
          className={className}
        />
      );
    },
    cell: ({ row, table }) => {
      function handleToggleRow(value: unknown) {
        row.toggleSelected(!!value);
      }

      function handleClick(e: React.MouseEvent) {
        e.stopPropagation();
      }

      return (
        <div onClick={handleClick}>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={handleToggleRow}
            aria-label={`Select row ${String(row.index + 1)} of ${String(table.getRowModel().rows.length)}`}
            className={className}
          />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
    meta: {
      type: "none",
      enableCsvExport: false,
    },
  };
}
