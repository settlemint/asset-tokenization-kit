"use client";

import { Badge } from "@/components/ui/badge";
import { Web3Address } from "@/components/web3/web3-address";
import { bigDecimal } from "@/lib/zod/validators/bigdecimal";
import { getEthereumAddress } from "@/lib/zod/validators/ethereum-address";
import { format as formatDnum, isDnum, toNumber } from "dnum";

/**
 * Helper function to safely convert a value to a number for formatting
 */
export function safeToNumber(value: unknown): number {
  if (typeof value === "number") {
    return Number.isNaN(value) ? 0 : value;
  }

  if (typeof value === "string") {
    try {
      const bigDecimalValue = bigDecimal().parse(value);
      const num = toNumber(bigDecimalValue);
      return Number.isNaN(num) ? 0 : num;
    } catch {
      const num = Number(value);
      return Number.isNaN(num) ? 0 : num;
    }
  }

  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
}

/**
 * Determines badge variant based on status value
 */
function getStatusVariant(
  statusValue: string
): "default" | "secondary" | "destructive" | "outline" {
  const value = statusValue.toLowerCase();

  const variants: Record<
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

  return variants[value] ?? "default";
}

/**
 * Renders an Ethereum address with truncation and copy functionality
 */
export function AddressCell({ value }: { value: unknown }) {
  try {
    const validAddress = getEthereumAddress(value);
    return (
      <Web3Address
        address={validAddress}
        copyToClipboard={true}
        showFullAddress={false}
        size="tiny"
        showSymbol={false}
      />
    );
  } catch {
    return (
      <span className="text-xs text-muted-foreground font-mono">
        {String(value)}
      </span>
    );
  }
}

/**
 * Renders a badge with automatic variant selection
 */
export function BadgeCell({
  value,
  displayName,
}: {
  value: unknown;
  displayName?: string;
}) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";

  if (displayName?.toLowerCase().includes("symbol")) {
    variant = "secondary";
  }

  if (displayName?.toLowerCase().includes("status")) {
    variant = getStatusVariant(String(value));
  }

  const isSymbol = displayName?.toLowerCase().includes("symbol");

  return (
    <Badge variant={variant} className={isSymbol ? "font-mono" : undefined}>
      {String(value)}
    </Badge>
  );
}

/**
 * Renders currency values with locale support
 */
export function CurrencyCell({
  value,
  locale,
  currency = "EUR",
}: {
  value: unknown;
  locale: string;
  currency?: string;
}) {
  const currencyValue = safeToNumber(value);
  return (
    <span className="text-right block tabular-nums">
      {new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }).format(currencyValue)}
    </span>
  );
}

/**
 * Renders date values with optional time
 */
export function DateCell({
  value,
  locale,
  includeTime,
}: {
  value: unknown;
  locale: string;
  includeTime?: boolean;
}) {
  const dateValue = value instanceof Date ? value : new Date(String(value));

  return (
    <span className="text-muted-foreground">
      {new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: includeTime ? "short" : undefined,
      }).format(dateValue)}
    </span>
  );
}

/**
 * Renders status badges with semantic colors
 */
export function StatusCell({ value }: { value: unknown }) {
  const variant = getStatusVariant(String(value));

  return <Badge variant={variant}>{String(value)}</Badge>;
}

/**
 * Renders numbers with locale support
 */
export function NumberCell({
  value,
  locale,
  displayName,
}: {
  value: unknown;
  locale: string;
  displayName?: string;
}) {
  // Check if value is a Dnum (big decimal) first
  if (isDnum(value)) {
    const formatted = formatDnum(value, {
      locale,
      digits: 2,
      trailingZeros: false,
    });

    return <span className="text-right block tabular-nums">{formatted}</span>;
  }

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

  return <span className="text-right block tabular-nums">{formatted}</span>;
}

/**
 * Default text cell renderer
 */
export function TextCell({ value }: { value: unknown }) {
  return <span>{String(value)}</span>;
}
