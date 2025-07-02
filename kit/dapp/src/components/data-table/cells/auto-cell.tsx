"use client";

import type { CellContext } from "@tanstack/react-table";
import { AddressCell } from "./address-cell";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const meta = context.column.columnDef.meta;
  const value = context.getValue();

  // If children are provided, use them (allows override)
  if (children) {
    return <>{children}</>;
  }

  // If no meta or cellType, render value as is
  if (!meta?.cellType) {
    return <>{String(value ?? "")}</>;
  }

  // Auto-render based on cellType with intelligent defaults
  switch (meta.cellType) {
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
      if (
        meta.displayName?.toLowerCase().includes("symbol") ||
        meta.type === "symbol"
      ) {
        variant = "secondary";
      }

      // For status columns, determine based on value
      if (
        meta.type === "status" ||
        meta.displayName?.toLowerCase().includes("status")
      ) {
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
      const isSymbol =
        meta.type === "symbol" ||
        meta.displayName?.toLowerCase().includes("symbol");

      return (
        <Badge variant={variant} className={isSymbol ? "font-mono" : undefined}>
          {String(value)}
        </Badge>
      );
    }

    case "currency": {
      const currencyValue = Number(value);
      return (
        <span className="font-mono text-right">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
          }).format(currencyValue)}
        </span>
      );
    }

    case "date": {
      const dateValue = value instanceof Date ? value : new Date(String(value));
      const includeTime =
        meta.type === "datetime" ||
        meta.displayName?.toLowerCase().includes("time");

      return (
        <span className="text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", {
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
      let decimals = 2;
      let useCompact = false;

      // No decimals for "decimals" columns
      if (
        meta.type === "decimals" ||
        meta.displayName?.toLowerCase().includes("decimal")
      ) {
        decimals = 0;
      }

      // Use compact notation for large numbers
      if (
        meta.type === "count" ||
        meta.displayName?.toLowerCase().includes("count")
      ) {
        useCompact = numberValue > 9999;
      }

      const formatted = useCompact
        ? new Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: 1,
          }).format(numberValue)
        : numberValue.toFixed(decimals);

      return (
        <span
          className={cn(
            "font-mono",
            meta.variant === "numeric" && "text-right"
          )}
        >
          {formatted}
        </span>
      );
    }

    case "text":
    default:
      return <span>{String(value)}</span>;
  }
}
