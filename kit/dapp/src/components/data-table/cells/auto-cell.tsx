"use client";

import { Badge } from "@/components/ui/badge";
import type { CellContext } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { AddressCell } from "./address-cell";

interface AutoCellProps<TData, TValue> {
  context: CellContext<TData, TValue>;
  children?: React.ReactNode;
}

/**
 * Automatically renders the appropriate cell component based on column meta type
 * Falls back to children or default text rendering if no type is specified
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
      return (
        <AddressCell
          address={String(value)}
          showCopyButton={true}
          truncateLength={6}
        />
      );

    case "badge": {
      // Determine variant based on column type or name
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "default";

      // For symbol columns, use secondary variant
      if (meta.displayName?.toLowerCase().includes("symbol")) {
        variant = "secondary";
      }

      // For status columns, determine based on value
      if (meta.displayName?.toLowerCase().includes("status")) {
        const statusValue = String(value).toLowerCase();
        if (
          ["active", "success", "completed", "approved", "enabled"].includes(
            statusValue
          )
        ) {
          variant = "default";
        } else if (
          ["inactive", "disabled", "archived", "paused"].includes(statusValue)
        ) {
          variant = "secondary";
        } else if (
          ["error", "failed", "rejected", "cancelled", "expired"].includes(
            statusValue
          )
        ) {
          variant = "destructive";
        } else if (
          ["pending", "draft", "processing", "review", "waiting"].includes(
            statusValue
          )
        ) {
          variant = "outline";
        }
      }

      // Apply font-mono for symbol-like badges
      const isSymbol = meta.displayName?.toLowerCase().includes("symbol");

      return (
        <Badge variant={variant} className={isSymbol ? "font-mono" : undefined}>
          {String(value)}
        </Badge>
      );
    }

    case "currency": {
      const currencyValue = Number(value);
      return (
        <span className="font-mono text-right block tabular-nums">
          {new Intl.NumberFormat(locale, {
            style: "currency",
            currency: meta.currency ?? "EUR",
            minimumFractionDigits: 2,
          }).format(currencyValue)}
        </span>
      );
    }

    case "date": {
      const dateValue = value instanceof Date ? value : new Date(String(value));
      const includeTime = meta.displayName?.toLowerCase().includes("time");

      return (
        <span className="text-muted-foreground">
          {new Intl.DateTimeFormat(locale, {
            dateStyle: "medium",
            timeStyle: includeTime ? "short" : undefined,
          }).format(dateValue)}
        </span>
      );
    }

    case "status": {
      const statusValue = String(value).toLowerCase();
      const statusVariants: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        // Success states
        active: "default",
        success: "default",
        completed: "default",
        approved: "default",
        enabled: "default",
        online: "default",
        available: "default",

        // Neutral/Inactive states
        inactive: "secondary",
        disabled: "secondary",
        archived: "secondary",
        offline: "secondary",
        unavailable: "secondary",
        paused: "secondary",

        // Error states
        error: "destructive",
        failed: "destructive",
        rejected: "destructive",
        cancelled: "destructive",
        expired: "destructive",
        blocked: "destructive",

        // Pending states
        pending: "outline",
        draft: "outline",
        processing: "outline",
        review: "outline",
        waiting: "outline",
        scheduled: "outline",
      };

      return (
        <Badge variant={statusVariants[statusValue] ?? "default"}>
          {String(value)}
        </Badge>
      );
    }

    case "number": {
      const numberValue = Number(value);

      // Determine formatting based on column metadata
      let minimumFractionDigits = 0;
      let maximumFractionDigits = 2;

      // No decimals for "decimals" columns
      if (meta.displayName?.toLowerCase().includes("decimal")) {
        minimumFractionDigits = 0;
        maximumFractionDigits = 0;
      }

      // Use compact notation for large numbers
      const useCompact =
        meta.displayName?.toLowerCase().includes("count") && numberValue > 9999;

      // Format with proper locale
      const formatted = new Intl.NumberFormat(locale, {
        notation: useCompact ? "compact" : "standard",
        minimumFractionDigits,
        maximumFractionDigits,
        ...(useCompact && { maximumFractionDigits: 1 }),
      }).format(numberValue);

      return (
        <span className="font-mono text-right block tabular-nums">
          {formatted}
        </span>
      );
    }

    case "text":
    default:
      return <span>{String(value)}</span>;
  }
}
