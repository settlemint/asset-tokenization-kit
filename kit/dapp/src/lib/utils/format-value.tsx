import { bigDecimal } from "@atk/zod/validators/bigdecimal";
import { getEthereumAddress } from "@atk/zod/validators/ethereum-address";
import { format as formatDnum, isDnum, toNumber } from "dnum";
import { Badge } from "@/components/ui/badge";
import { Web3Address } from "@/components/web3/web3-address";
import { formatDate } from "./date";

/**
 * Safely convert any value to a string
 * Handles objects by checking for toString method or using JSON.stringify
 */
export function safeToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "symbol") {
    return value.toString();
  }

  if (typeof value === "function") {
    return "[Function]";
  }

  if (typeof value === "object") {
    // Check if it has a meaningful toString method
    if (value instanceof Date) {
      return value.toISOString();
    }

    // For other objects, use JSON representation
    try {
      return JSON.stringify(value);
    } catch {
      return "[Object]";
    }
  }

  // This should never be reached, but satisfies TypeScript
  return "[Unknown]";
}

/**
 * Type definition for value formatting options
 */
export interface FormatValueOptions {
  type?:
    | "address"
    | "badge"
    | "currency"
    | "date"
    | "status"
    | "percentage"
    | "number"
    | "text"
    | "boolean"
    | "multiOption"
    | "option";
  displayName?: string;
  currency?: string;
  locale?: string;
  emptyValue?: React.ReactNode;
  showPrettyName?: boolean;
}

/**
 * Helper function to safely convert a value to a number for formatting
 * Uses dnum for precision handling when the value is a string
 * Returns 0 for NaN values
 */
export function safeToNumber(value: unknown): number {
  // If it's already a number, check for NaN
  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : value;
  }

  // If it's a string, try to parse it with dnum for precision
  if (typeof value === "string") {
    try {
      const bigDecimalValue = bigDecimal().parse(value);
      const num = toNumber(bigDecimalValue);
      return Number.isNaN(num) ? 0 : num;
    } catch {
      // If parsing fails, fallback to Number conversion
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    }
  }

  // For other types, use Number conversion
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Format a value based on its type
 * @param value - The value to format
 * @param options - Formatting options including type and metadata
 * @returns Formatted JSX element or string
 */
export function formatValue(
  value: unknown,
  options: FormatValueOptions = {}
): React.ReactNode {
  const {
    type,
    displayName,
    currency = "EUR",
    locale = "en",
    emptyValue,
    showPrettyName = true,
  } = options;

  // Check if value is empty/null/undefined
  if (value === null || value === undefined || value === "") {
    return emptyValue === undefined ? "" : emptyValue;
  }

  // If no type, return value as is
  if (!type) {
    return safeToString(value);
  }

  // Auto-render based on type with intelligent defaults
  switch (type) {
    case "address":
      try {
        const validAddress = getEthereumAddress(value);
        return (
          <Web3Address
            address={validAddress}
            copyToClipboard={true}
            showFullAddress={false}
            size="tiny"
            showSymbol={false}
            showPrettyName={showPrettyName}
          />
        );
      } catch {
        // If address is invalid, show the raw value
        return (
          <span className="text-xs text-muted-foreground font-mono">
            {safeToString(value)}
          </span>
        );
      }

    case "badge": {
      // Determine variant based on column type or name
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "default";

      // For symbol columns, use secondary variant
      if (displayName?.toLowerCase().includes("symbol")) {
        variant = "secondary";
      }

      // For status columns, determine based on value
      if (displayName?.toLowerCase().includes("status")) {
        const statusValue = safeToString(value).toLowerCase();
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

      // Apply for symbol-like badges
      const isSymbol = displayName?.toLowerCase().includes("symbol");

      return (
        <Badge variant={variant} className={isSymbol ? "font-mono" : undefined}>
          {safeToString(value)}
        </Badge>
      );
    }

    case "currency": {
      // Use safe number conversion to handle large values without precision loss
      const currencyValue = safeToNumber(value);

      // Try to format with Intl.NumberFormat
      try {
        return (
          <span className="text-right block tabular-nums">
            {new Intl.NumberFormat(locale, {
              style: "currency",
              currency: currency,
              minimumFractionDigits: 2,
            }).format(currencyValue)}
          </span>
        );
      } catch {
        // If currency is not recognized (e.g., token symbols), format as "value symbol"
        const formatted = new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(currencyValue);

        return (
          <span className="block tabular-nums">
            {formatted} {currency}
          </span>
        );
      }
    }

    case "date": {
      const dateValue =
        value instanceof Date ? value : new Date(safeToString(value));
      const includeTime = displayName?.toLowerCase().includes("time");

      return (
        <span>
          {formatDate(
            dateValue,
            {
              dateStyle: "medium",
              timeStyle: includeTime ? "short" : undefined,
            },
            locale
          )}
        </span>
      );
    }

    case "status": {
      const statusValue = safeToString(value).toLowerCase();
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
          {safeToString(value)}
        </Badge>
      );
    }

    case "percentage": {
      // Check if value is a Dnum (big decimal) first
      if (isDnum(value)) {
        // Format Dnum with locale-aware formatting
        const formatted = formatDnum(value, {
          locale,
          digits: 2,
          trailingZeros: false,
        });

        return <span className="block tabular-nums">{formatted}%</span>;
      }

      // Use safe number conversion to handle large values without precision loss
      const percentageValue = safeToNumber(value);

      // Format with proper locale
      const formatted = new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(percentageValue);

      return <span className="block tabular-nums">{formatted}%</span>;
    }

    case "number": {
      // Check if value is a Dnum (big decimal) first
      if (isDnum(value)) {
        // Format Dnum with locale-aware formatting
        const formatted = formatDnum(value, {
          locale,
          digits: 2,
          trailingZeros: false,
        });

        return <span className="block tabular-nums">{formatted}</span>;
      }

      // Use safe number conversion to handle large values without precision loss
      // This will return 0 for NaN values
      const numberValue = safeToNumber(value);

      // Determine formatting based on column metadata
      let minimumFractionDigits = 0;
      let maximumFractionDigits = 2;

      // No decimals for "decimals" columns
      if (displayName?.toLowerCase().includes("decimal")) {
        minimumFractionDigits = 0;
        maximumFractionDigits = 0;
      }

      // Use compact notation for large numbers
      const useCompact =
        displayName?.toLowerCase().includes("count") && numberValue > 9999;

      // Format with proper locale
      const formatted = new Intl.NumberFormat(locale, {
        notation: useCompact ? "compact" : "standard",
        minimumFractionDigits,
        maximumFractionDigits,
        ...(useCompact && { maximumFractionDigits: 1 }),
      }).format(numberValue);

      return <span className="block tabular-nums">{formatted}</span>;
    }

    case "text":
      return <span>{safeToString(value)}</span>;

    case "boolean":
      return <span>{value ? "Yes" : "No"}</span>;

    case "option":
    case "multiOption":
      // For option/multiOption, format as badges or text
      if (Array.isArray(value)) {
        return (
          <div className="flex gap-1 flex-wrap">
            {value.map((item, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {safeToString(item)}
              </Badge>
            ))}
          </div>
        );
      }
      return <Badge variant="secondary">{safeToString(value)}</Badge>;

    default:
      return <span>{safeToString(value)}</span>;
  }
}
