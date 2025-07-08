"use client";

import type { CellContext } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import {
  AddressCell,
  BadgeCell,
  CurrencyCell,
  DateCell,
  StatusCell,
  NumberCell,
  TextCell,
} from "./cell-renderers";

/**
 * Props for the AutoCell component
 * @interface AutoCellProps
 * @template TData - The type of the data object for the row
 * @template TValue - The type of the value being rendered
 */
interface AutoCellProps<TData, TValue> {
  /** The cell context from TanStack Table containing column and value information */
  context: CellContext<TData, TValue>;
  /** Optional children to override automatic rendering */
  children?: React.ReactNode;
}

/**
 * Automatically renders the appropriate cell component based on column meta type.
 * Falls back to children or default text rendering if no type is specified.
 *
 * Supported column meta types:
 * - `address`: Renders AddressCell with truncation and copy functionality
 * - `badge`: Renders Badge with automatic variant selection based on column name/value
 * - `currency`: Formats as currency with locale support
 * - `date`: Formats dates with optional time display
 * - `status`: Renders status badges with semantic color variants
 * - `number`: Formats numbers with locale support and optional compact notation
 * - `text`: Default text rendering
 *
 * @example
 * ```tsx
 * // In your column definition
 * {
 *   accessorKey: "walletAddress",
 *   header: "Wallet",
 *   meta: { type: "address" },
 *   cell: ({ cell }) => <AutoCell context={cell} />
 * }
 *
 * // With override
 * {
 *   accessorKey: "amount",
 *   meta: { type: "currency", currency: "USD" },
 *   cell: ({ cell }) => (
 *     <AutoCell context={cell}>
 *       {cell.getValue() > 1000 && <span>🔥</span>}
 *     </AutoCell>
 *   )
 * }
 * ```
 *
 * @template TData - The type of the data object for the row
 * @template TValue - The type of the value being rendered
 * @param props - The component props
 * @returns The appropriate cell component based on the column meta type
 */
export function AutoCell<TData, TValue>({
  context,
  children,
}: AutoCellProps<TData, TValue>) {
  const { i18n } = useTranslation();
  const meta = context.column.columnDef.meta;
  const value = context.getValue();
  const locale = i18n.language;

  // If children are provided, use them (allows override)
  if (children) {
    return <>{children}</>;
  }

  // If no meta or type, render value as is
  if (!meta?.type) {
    return <>{String(value ?? "")}</>;
  }

  // Auto-render based on type with intelligent defaults
  switch (meta.type) {
    case "address":
      return <AddressCell value={value} />;

    case "badge":
      return <BadgeCell value={value} displayName={meta.displayName} />;

    case "currency":
      return (
        <CurrencyCell value={value} locale={locale} currency={meta.currency} />
      );

    case "date":
      return (
        <DateCell
          value={value}
          locale={locale}
          includeTime={meta.displayName?.toLowerCase().includes("time")}
        />
      );

    case "status":
      return <StatusCell value={value} />;

    case "number":
      return (
        <NumberCell
          value={value}
          locale={locale}
          displayName={meta.displayName}
        />
      );

    case "text":
    default:
      return <TextCell value={value} />;
  }
}
