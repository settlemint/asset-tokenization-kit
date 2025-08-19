import { useTranslation } from "react-i18next";
import type { FormatValueProps } from "./types";

export function FormatBoolean({ value }: FormatValueProps) {
  const { t } = useTranslation("common");
  return <span>{value ? t("yes") : t("no")}</span>;
}
