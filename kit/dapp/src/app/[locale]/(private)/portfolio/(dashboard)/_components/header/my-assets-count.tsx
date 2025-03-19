import { formatNumber } from "@/lib/utils/number";
import { useLocale, useTranslations } from "next-intl";

export function MyAssetsCount({ total }: { total: string }) {
  const t = useTranslations("portfolio");
  const locale = useLocale();

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="mr-1 font-bold text-4xl">
          {formatNumber(total, { locale })}
        </span>
        <span>{t("assets-count-assets")}</span>
      </div>
    </div>
  );
}
