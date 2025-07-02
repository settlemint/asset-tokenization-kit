import type { Column, ColumnMeta, Table } from "@tanstack/react-table";
import { PropertyFilterDateValueMenu } from "./date-value-menu";
import { PropertyFilterMultiOptionValueMenu } from "./multi-option-value-menu";
import { PropertyFilterNumberValueMenu } from "./number-value-menu";
import { PropertyFilterOptionValueMenu } from "./option-value-menu";
import { PropertyFilterTextValueMenu } from "./text-value-menu";

interface PropertyFilterValueMenuProps<TData, TValue> {
  id: string;
  column: Column<TData>;
  columnMeta: ColumnMeta<TData, TValue>;
  table: Table<TData>;
  onClose?: () => void;
}

export function PropertyFilterValueMenu<TData, TValue>({
  id,
  column,
  columnMeta,
  table,
  onClose,
}: PropertyFilterValueMenuProps<TData, TValue>) {
  switch (columnMeta.type) {
    case "option":
      return (
        <PropertyFilterOptionValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
          onClose={onClose}
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
        />
      );
    case "text":
      return (
        <PropertyFilterTextValueMenu
          id={id}
          column={column}
          columnMeta={columnMeta}
          table={table}
          onClose={onClose}
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
        />
      );
    default:
      return null;
  }
}
