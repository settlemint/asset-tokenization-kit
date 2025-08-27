import { FormatAddress } from "./format-address";
import { FormatBoolean } from "./format-boolean";
import { FormatCurrency } from "./format-currency";
import { FormatDate } from "./format-date";
import { FormatNumber } from "./format-number";
import { FormatOption } from "./format-option";
import { FormatPercentage } from "./format-percentage";
import { FormatStatus } from "./format-status";
import { FormatText } from "./format-text";
import { safeToString } from "./safe-to-string";
import type { FormatValueOptions } from "./types";

/**
 * Format a value based on its type
 * @param value - The value to format
 * @param options - Formatting options including type and metadata
 * @returns Formatted JSX element or string
 */
export function formatValue(
  value: unknown,
  options: FormatValueOptions
): React.ReactNode {
  const { type, emptyValue } = options;

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
      return <FormatAddress value={value} options={options} />;

    case "currency":
      return <FormatCurrency value={value} options={options} />;

    case "date":
      return <FormatDate value={value} options={options} />;

    case "status":
      return <FormatStatus value={value} options={options} />;

    case "percentage":
      return <FormatPercentage value={value} options={options} />;

    case "number":
      return <FormatNumber value={value} options={options} />;

    case "text":
      return <FormatText value={value} options={options} />;

    case "boolean":
      return <FormatBoolean value={value} options={options} />;

    case "option":
    case "multiOption":
      return <FormatOption value={value} options={options} />;

    case "none":
      // Return the value as-is without formatting
      return value as React.ReactNode;

    default:
      return <span>{safeToString(value)}</span>;
  }
}
