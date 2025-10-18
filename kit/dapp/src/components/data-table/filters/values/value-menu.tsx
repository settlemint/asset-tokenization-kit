import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { PropertyFilterDateValueMenu } from "./date-value-menu";
import { PropertyFilterMultiOptionValueMenu } from "./multi-option-value-menu";
import { PropertyFilterNumberValueMenu } from "./number-value-menu";
import { PropertyFilterOptionValueMenu } from "./option-value-menu";
import { PropertyFilterTextValueMenu } from "./text-value-menu";

/**
 * Props for the PropertyFilterValueMenu component
 * @template TData - The data type of the table rows
 * @template TValue - The value type of the column
 */
interface PropertyFilterValueMenuProps<TData, TValue> {
  /** Column identifier */
  id: string;
  /** Column instance from TanStack Table */
  column: Column<TData>;
  /** Column metadata containing display and filter configuration */
  columnMeta: ColumnMeta<TData, TValue>;
  /** Table instance from TanStack Table */
  table: Table<TData>;
  /** Callback fired when the menu should close */
  onClose?: () => void;
  /** Callback fired when navigating back to parent menu */
  onBack?: () => void;
}

/**
 * A factory component that renders the appropriate filter value menu based on the column type.
 * This component acts as a router, delegating to specific filter components:
 * - `option`: Single selection from a list
 * - `multiOption`: Multiple selections from a list
 * - `date`: Date or date range picker
 * - `text`/`address`: Text-based filtering with contains/does not contain
 * - `number`: Numeric filtering with single value or range
 *
 * @template TData - The data type of the table rows
 * @template TValue - The value type of the column
 *
 * @example
 * ```tsx
 * <PropertyFilterValueMenu
 *   id={column.id}
 *   column={column}
 *   columnMeta={column.columnDef.meta}
 *   table={table}
 *   onClose={() => setOpen(false)}
 *   onBack={() => setView('main')}
 * />
 * ```
 *
 * @returns The appropriate filter component for the column type, or null if type is unsupported
 */
export function PropertyFilterValueMenu<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
  onClose,
  onBack,
}: PropertyFilterValueMenuProps<TData, TValue>) {
  switch (columnMeta.type) {
    case "option":
    case "status":
      return (
        <PropertyFilterOptionValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
          onClose={onClose}
          onBack={onBack}
        />
      );
    case "multiOption":
      return (
        <PropertyFilterMultiOptionValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
          onClose={onClose}
          onBack={onBack}
        />
      );
    case "date":
      return (
        <PropertyFilterDateValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
          onClose={onClose}
          onBack={onBack}
        />
      );
    case "text":
    case "address": // Treat address as text for filtering
      return (
        <PropertyFilterTextValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
          onClose={onClose}
          onBack={onBack}
        />
      );
    case "number":
      return (
        <PropertyFilterNumberValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
          onClose={onClose}
          onBack={onBack}
        />
      );
    default:
      return null;
  }
}
