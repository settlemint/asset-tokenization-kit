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

  // Auto-render based on cellType
  switch (meta.cellType) {
    case "address":
      return (
        <AddressCell
          address={String(value)}
          {...(meta.cellProps as {
            showCopyButton?: boolean;
            truncateLength?: number;
          })}
        />
      );

    case "badge":
      return (
        <Badge
          variant={
            (
              meta.cellProps as {
                variant?: "default" | "secondary" | "destructive" | "outline";
              }
            )?.variant ?? "default"
          }
          className={(meta.cellProps as { className?: string })?.className}
        >
          {String(value)}
        </Badge>
      );

    case "currency": {
      const currencyValue = Number(value);
      const {
        currency = "USD",
        locale = "en-US",
        minimumFractionDigits = 2,
      } = (meta.cellProps ?? {}) as {
        currency?: string;
        locale?: string;
        minimumFractionDigits?: number;
      };
      return (
        <span className="font-mono text-right">
          {new Intl.NumberFormat(locale, {
            style: "currency",
            currency,
            minimumFractionDigits,
          }).format(currencyValue)}
        </span>
      );
    }

    case "date": {
      const dateValue = value instanceof Date ? value : new Date(String(value));
      const { dateStyle = "medium", timeStyle } = (meta.cellProps ?? {}) as {
        dateStyle?: "full" | "long" | "medium" | "short";
        timeStyle?: "full" | "long" | "medium" | "short";
      };
      return (
        <span className="text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", { dateStyle, timeStyle }).format(
            dateValue
          )}
        </span>
      );
    }

    case "status": {
      const statusVariants: Record<
        string,
        "default" | "secondary" | "destructive" | "outline"
      > = {
        active: "default",
        inactive: "secondary",
        error: "destructive",
        pending: "outline",
        ...(
          meta.cellProps as {
            variants?: Record<
              string,
              "default" | "secondary" | "destructive" | "outline"
            >;
          }
        )?.variants,
      };
      const statusValue = String(value).toLowerCase();
      return (
        <Badge variant={statusVariants[statusValue] ?? "default"}>
          {String(value)}
        </Badge>
      );
    }

    case "number": {
      const numberValue = Number(value);
      const { precision = 0, compact = false } = (meta.cellProps ?? {}) as {
        precision?: number;
        compact?: boolean;
      };
      const formatted = compact
        ? new Intl.NumberFormat("en-US", {
            notation: "compact",
            maximumFractionDigits: precision,
          }).format(numberValue)
        : numberValue.toFixed(precision);
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
      return (
        <span className={(meta.cellProps as { className?: string })?.className}>
          {String(value)}
        </span>
      );
  }
}
