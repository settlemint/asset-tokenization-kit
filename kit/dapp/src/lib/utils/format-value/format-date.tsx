import { formatDate } from "@/lib/utils/date";
import { FormatValueProps } from "@/lib/utils/format-value/types";
import { useTranslation } from "react-i18next";
import { safeToString } from "./safe-to-string";

export function FormatDate({ value, options }: FormatValueProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const { displayName } = options;

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
