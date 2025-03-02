import { useTranslations } from "next-intl";
import { Widget } from "./widget";

export function AssetsWidget() {
  const t = useTranslations("admin.dashboard.widgets");

  return (
    <Widget label={t("assets.label")} value="1" subtext={t("assets.subtext")} />
  );
}
