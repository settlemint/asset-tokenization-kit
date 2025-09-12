import { formatDate } from "@/lib/utils/date";
import { FormatValueProps } from "@/lib/utils/format-value/types";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useTranslation } from "react-i18next";
import { safeToString } from "./safe-to-string";

export function FormatDate({ value, options }: FormatValueProps) {
  const { i18n, t } = useTranslation("common");
  const locale = i18n.language;
  const { displayName, dateOptions } = options;

  const dateValue =
    value instanceof Date ? value : new Date(safeToString(value));
  const includeTime =
    dateOptions?.includeTime ?? displayName?.toLowerCase().includes("time");

  const relative = dateOptions?.relative ?? false;

  if (relative) {
    // Format with relative time for recent dates
    if (isToday(dateValue)) {
      return <span className="text-sm">{t("dates.today")}</span>;
    }

    if (isYesterday(dateValue)) {
      return <span className="text-sm">{t("dates.yesterday")}</span>;
    }

    const daysDiff = Math.floor(
      (Date.now() - dateValue.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff <= 7 && daysDiff > 0) {
      return (
        <span className="text-sm">
          {formatDistanceToNow(dateValue, { addSuffix: true })}
        </span>
      );
    }
  }

  return (
    <span className="text-sm">
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
