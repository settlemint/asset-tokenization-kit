import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("common");
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
      return <span className="text-sm">{t("dates.today")}</span>;
    }

    if (isYesterday(date)) {
      return <span className="text-sm">{t("dates.yesterday")}</span>;
    }

    const daysDiff = Math.floor(
      (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff <= 7 && daysDiff > 0) {
      return (
        <span className="text-sm">
          {formatDistanceToNow(date, { addSuffix: true })}
        </span>
      );
    }
  }

  return <span className="text-sm">{format(date, "MMM d, yyyy")}</span>;
}
