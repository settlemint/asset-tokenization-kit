import { formatDistanceToNow, isToday, isYesterday, format } from "date-fns";

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

  if (relative) {
    // Format with relative time for recent dates
    if (isToday(date)) {
      return <span className="text-sm">Today</span>;
    }
    
    if (isYesterday(date)) {
      return <span className="text-sm">Yesterday</span>;
    }
    
    const daysDiff = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff <= 7 && daysDiff > 0) {
      return (
        <span className="text-sm">
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      );
    }
  }

  return (
    <span className="text-sm">
      {format(date, 'MMM d, yyyy')}
    </span>
  );
}