import { FormatDate } from "@/lib/utils/format-value/format-date";

interface DateCellProps {
  value?: string | Date | null;
  fallback?: string;
  relative?: boolean;
}

/**
 * Reusable date cell component for data tables.
 * Handles date formatting with optional relative time display.
 */
export function DateCell({
  value,
  fallback = "–",
  relative = false,
}: DateCellProps) {
  if (!value) {
    return <span className="text-sm text-muted-foreground">{fallback}</span>;
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return <span className="text-sm text-muted-foreground">{fallback}</span>;
  }

  return (
    <FormatDate
      value={value}
      options={{ type: "date", dateOptions: { relative } }}
    />
  );
}
